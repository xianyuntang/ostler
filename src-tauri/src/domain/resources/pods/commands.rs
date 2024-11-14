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

    state.lock().await.future_manager.add(id.clone(), handle);

    Ok(Response {
        data: json!({"event":id}),
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

    let id = nanoid!();

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

    state.lock().await.future_manager.add(id.clone(), handle);

    Ok(Response {
        data: json!({"stdinEvent":stdin_id, "stdoutEvent":stdout_id, "event":id}),
    })
}
