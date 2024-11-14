use std::net::SocketAddr;
use std::sync::Arc;

use crate::domain::resources::pods::attached::StdoutEventData;
use crate::domain::{client::api_helper::get_api, resources::pods::attached::StdinEventData};
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use chrono::{Duration as ChronoDuration, Utc};
use futures::{AsyncBufReadExt, StreamExt, TryStreamExt};
use k8s_openapi::api::core::v1::Pod;
use kube::api::{AttachParams, ListParams, LogParams};

use log;
use nanoid::nanoid;
use serde_json::json;

use tauri::{Emitter, Listener, State, Window};
use tokio::net::TcpSocket;
use tokio::{io::AsyncWriteExt, sync::Mutex};
use tokio_util;

#[tauri::command]
pub async fn list_pods(
    state: State<'_, Mutex<AppData>>,
    namespace: &str,
) -> Result<Response, ApiError> {
    log::info!("list_pods called");

    let client = state.lock().await.client_manager.get_client().await?;

    let api = get_api::<Pod>(client, namespace);

    let pods = api
        .list(&ListParams::default())
        .await?
        .items
        .into_iter()
        .collect::<Vec<_>>();

    Ok(Response { data: json!(pods) })
}

#[tauri::command]
pub async fn start_log_stream(
    window: Window,
    state: State<'_, Mutex<AppData>>,
    namespace: &str,
    pod_name: &str,
    container_name: String,
) -> Result<Response, ApiError> {
    log::debug!("start_log_stream called");

    let client = state.lock().await.client_manager.get_client().await?;

    let api = get_api::<Pod>(client, namespace);

    let ten_minutes_ago = Utc::now() - ChronoDuration::minutes(60);

    let mut reader = api
        .log_stream(
            pod_name,
            &LogParams {
                container: Some(container_name),
                since_time: Some(ten_minutes_ago),
                follow: true,
                timestamps: true,
                ..LogParams::default()
            },
        )
        .await?
        .lines();

    let id = nanoid!();
    let id_clone = id.clone();
    let handle = tokio::spawn(async move {
        while let Some(line) = reader.try_next().await? {
            window.emit_to("main", &id_clone, line)?;
        }
        Ok(())
    });

    let future_id = state.lock().await.future_manager.add(handle);

    Ok(Response {
        data: json!({"event":id, "futureId":future_id}),
    })
}

#[tauri::command]
pub async fn start_exec_stream(
    window: Window,
    state: State<'_, Mutex<AppData>>,
    namespace: &str,
    pod_name: &str,
    container_name: String,
) -> Result<Response, ApiError> {
    log::debug!("start_exec_stream called");

    let client = state.lock().await.client_manager.get_client().await?;

    let api = get_api::<Pod>(client, namespace);

    let attach_params = AttachParams {
        container: Some(container_name),
        stdin: true,
        stdout: true,
        stderr: false,
        tty: true,
        ..Default::default()
    };

    let command = vec!["sh"];

    let mut attached: kube::api::AttachedProcess =
        api.exec(pod_name, command, &attach_params).await?;

    let stdin_id = nanoid!();
    let stdin_id_clone = stdin_id.clone();

    let stdout_id = nanoid!();
    let stdout_id_clone = stdout_id.clone();

    let stdin = Arc::new(Mutex::new(attached.stdin().unwrap()));

    let stdout = attached.stdout().unwrap();
    let mut output = tokio_util::io::ReaderStream::new(stdout);

    let handle = tokio::spawn(async move {
        window.listen(stdin_id_clone.clone(), move |event| {
            let stdin_clone = Arc::clone(&stdin);
            tokio::spawn(async move {
                let event_data = serde_json::from_str::<StdinEventData>(event.payload())?;
                let mut stdin = stdin_clone.lock().await;
                stdin.write_all(event_data.key.as_bytes()).await?;

                Ok::<(), ApiError>(())
            });
        });

        while let Some(Ok(message)) = output.next().await {
            window.emit_to("main", &stdout_id_clone, json!(StdoutEventData { message }))?;
        }

        Ok::<(), ApiError>(())
    });

    let future_id = state.lock().await.future_manager.add(handle);

    Ok(Response {
        data: json!({"stdinEvent":stdin_id, "stdoutEvent":stdout_id, "futureId":future_id}),
    })
}

#[tauri::command]
pub async fn start_portforward(
    state: State<'_, Mutex<AppData>>,
    namespace: &str,
    name: &str,
    container_port: u16,
    local_port: u16,
) -> Result<Response, ApiError> {
    log::info!("start_portforward called");

    let client = state.lock().await.client_manager.get_client().await?;

    let api = get_api::<Pod>(client.clone(), namespace);
    let socket = TcpSocket::new_v4()?;

    socket.set_reuseaddr(false)?;
    socket.bind(format!("127.0.0.1:{}", local_port).parse::<SocketAddr>()?)?;

    let listener = socket.listen(1024)?;

    let api_arc = Arc::new(api);
    let name_arc = Arc::new(name.to_string());

    let handle = tokio::spawn(async move {
        loop {
            match listener.accept().await {
                Ok((socket, _)) => {
                    let api_clone = Arc::clone(&api_arc);
                    let name_clone = Arc::clone(&name_arc);
                    tokio::spawn(async move {
                        let mut pf = api_clone
                            .portforward(&name_clone, &[container_port])
                            .await?;
                        let stream = pf.take_stream(container_port).ok_or(ApiError::Io(
                            std::io::Error::new(std::io::ErrorKind::Other, "Cannot take stream"),
                        ))?;
                        let (mut resource_reader, mut resource_writer) = tokio::io::split(stream);
                        let (mut socket_reader, mut socket_writer) = tokio::io::split(socket);

                        let client_to_resource = tokio::spawn(async move {
                            tokio::io::copy(&mut socket_reader, &mut resource_writer).await?;
                            resource_writer.shutdown().await?;
                            Ok::<(), ApiError>(())
                        });

                        let resource_to_client = tokio::spawn(async move {
                            tokio::io::copy(&mut resource_reader, &mut socket_writer).await?;
                            socket_writer.shutdown().await?;

                            Ok::<(), ApiError>(())
                        });

                        let (res1, res2) = tokio::join!(client_to_resource, resource_to_client);
                        res1??;
                        res2??;
                        Ok::<(), ApiError>(())
                    });
                }
                Err(e) => {
                    log::error!("Error accepting connection: {:?}", e);
                    break;
                }
            }
        }
        Ok::<(), ApiError>(())
    });

    let future_id = state.lock().await.future_manager.add(handle);

    Ok(Response {
        data: json!({"futureId":future_id}),
    })
}
