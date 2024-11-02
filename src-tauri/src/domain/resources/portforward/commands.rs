use crate::domain::client::api_helper::get_api;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use k8s_openapi::api::core::v1::Pod;
use serde_json::json;

use log;
use tauri::async_runtime::Mutex;
use tauri::State;

#[tauri::command]
pub async fn start_portforward(
    state: State<'_, Mutex<AppData>>,
    namespace: &str,
    resource: &str,
    name: &str,
    container_port: u16,
    local_port: u16,
) -> Result<Response, ApiError> {
    log::info!("start_portforward called");

    let app_data = state.lock().await;

    let client = app_data.client_manager.get_client().await?;
    let portforward_manager = &app_data.portforward_manager;

    if resource == "pod" {
        let api = get_api::<Pod>(client.clone(), namespace);
        portforward_manager
            .start_portforward(api, name.to_string(), container_port, local_port)
            .await?;
    }

    Ok(Response {
        data: json!({"message":"ok"}),
    })
}

#[tauri::command]
pub async fn stop_portforward(
    state: State<'_, Mutex<AppData>>,
    name: &str,
) -> Result<Response, ApiError> {
    log::info!("stop_portforward called");

    let app_data = state.lock().await;

    let portforward_manager = &app_data.portforward_manager;
    portforward_manager.stop_portforward(name);

    Ok(Response {
        data: json!({"message":"ok"}),
    })
}
