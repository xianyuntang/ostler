use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::State;

#[tauri::command]
pub async fn list_contexts(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    tracing::info!("list_contexts called");

    let app_data = state.lock().await;

    let contexts = app_data.client_manager.list_available_contexts().await;
    let current = app_data.client_manager.get_current_context();

    Ok(Response {
        data: json!({"contexts":contexts, "current":current}),
    })
}

#[tauri::command]
pub async fn switch_context(
    state: State<'_, Mutex<AppData>>,
    context: String,
) -> Result<Response, ApiError> {
    tracing::info!("switch_context called");

    let mut app_data = state.lock().await;
    let client_manager = &mut app_data.client_manager;

    client_manager.switch_context(context).await;

    Ok(Response {
        data: json!({"message":"ok"}),
    })
}
