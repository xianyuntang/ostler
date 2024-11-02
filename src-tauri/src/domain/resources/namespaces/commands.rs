use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use k8s_openapi::api::core::v1::Namespace;
use kube::api::ListParams;
use kube::Api;
use log;
use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::State;

#[tauri::command]
pub async fn list_namespaces(state: State<'_, Mutex<AppData>>) -> Result<Response, ApiError> {
    log::debug!("list_namespaces called");

    let app_data = state.lock().await;

    let client = app_data.client_manager.get_client().await?;
    let client_clone = client.clone();

    let namespaces = Api::<Namespace>::all(client_clone)
        .list(&ListParams::default())
        .await?
        .items
        .into_iter()
        .map(|namespace| namespace.metadata.name.unwrap_or("".into()))
        .collect::<Vec<_>>();
    Ok(Response {
        data: json!({"namespaces":namespaces, "default":client.default_namespace()}),
    })
}
