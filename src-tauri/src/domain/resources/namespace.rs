use crate::infrastructure::app::AppData;
use crate::infrastructure::error::Error;
use crate::infrastructure::response::Response;
use k8s_openapi::api::core::v1::Namespace;
use kube::api::ListParams;
use kube::Api;
use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::State;
use tracing;

#[tauri::command]
pub async fn list_namespaces(state: State<'_, Mutex<AppData>>) -> Result<Response, Error> {
    tracing::info!("list_namespaces called");

    let app_data = state.lock().await;

    let client = app_data.client_manager.get_client().await;

    let namespaces = Api::<Namespace>::all(client)
        .list(&ListParams::default())
        .await?
        .items
        .into_iter()
        .map(|namespace| namespace.metadata.name.unwrap_or("".into()))
        .collect::<Vec<_>>();

    Ok(Response {
        data: json!(namespaces),
    })
}
