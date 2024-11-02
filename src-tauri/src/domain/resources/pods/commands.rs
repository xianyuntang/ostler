use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use k8s_openapi::api::core::v1::Pod;
use kube::api::{ListParams, LogParams};
use serde_json::json;

use crate::domain::client::api_helper::get_api;
use log;
use tauri::async_runtime::Mutex;
use tauri::State;

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
pub async fn get_pod_logs(
    state: State<'_, Mutex<AppData>>,
    namespace: &str,
    pod_name: &str,
    container_name: String,
) -> Result<Response, ApiError> {
    log::debug!("get_pod_log called");

    let client = state.lock().await.client_manager.get_client().await?;

    let api = get_api::<Pod>(client, namespace);

    let logs = api
        .logs(
            pod_name,
            &LogParams {
                container: Some(container_name),
                tail_lines: Some(100),
                ..LogParams::default()
            },
        )
        .await?
        .lines()
        .map(|line| line.to_string())
        .collect::<Vec<_>>();

    Ok(Response { data: json!(logs) })
}
