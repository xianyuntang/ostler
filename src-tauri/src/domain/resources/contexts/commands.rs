use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::State;
use tokio::fs::File;
use tokio::io::AsyncReadExt;

#[tauri::command]
pub async fn add_context(
    state: State<'_, Mutex<AppData>>,
    file_path: String,
) -> Result<Response, ApiError> {
    log::debug!("add_context called");

    let mut app_data = state.lock().await;

    let mut kubeconfig_file = File::open(file_path).await?;
    let mut kubeconfig_content = String::new();
    kubeconfig_file
        .read_to_string(&mut kubeconfig_content)
        .await?;

    app_data.client_manager.add(&kubeconfig_content)?;

    let kubeconfig_contents = app_data.client_manager.to_vec()?;

    app_data
        .store
        .set("kubeconfig_contents", kubeconfig_contents);

    Ok(Response {
        data: json!({"message":"ok"}),
    })
}

#[tauri::command]
pub async fn remove_context(
    state: State<'_, Mutex<AppData>>,
    context: &str,
) -> Result<Response, ApiError> {
    log::debug!("list_contexts called");

    let mut app_data = state.lock().await;

    app_data.client_manager.remove(context)?;

    let kubeconfig_contents = app_data.client_manager.to_vec()?;

    app_data
        .store
        .set("kubeconfig_contents", kubeconfig_contents);

    Ok(Response {
        data: json!({"message":"ok"}),
    })
}

#[tauri::command]
pub async fn list_contexts(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("list_contexts called");

    let app_data = state.lock().await;

    let contexts = app_data.client_manager.list_contexts();

    Ok(Response {
        data: json!({"contexts":contexts}),
    })
}

#[tauri::command]
pub async fn switch_context(
    state: State<'_, Mutex<AppData>>,
    context: &str,
) -> Result<Response, ApiError> {
    log::debug!("switch_context called");

    let mut app_data = state.lock().await;
    let client_manager = &mut app_data.client_manager;

    client_manager.switch_context(context)?;

    Ok(Response {
        data: json!({"message":"ok"}),
    })
}
