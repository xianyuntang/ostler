use crate::infrastructure::app::AppData;
use crate::infrastructure::error::Error;
use crate::infrastructure::response::Response;
use k8s_openapi::api::core::v1::Pod;
use kube::api::ListParams;
use kube::Api;
use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::State;

#[tauri::command]
pub async fn list_pods(
    state: State<'_, Mutex<AppData>>,
    namespace: &str,
) -> Result<Response, Error> {
    tracing::info!("list_pods called");

    let client = state.lock().await.client_manager.get_client().await;

    let pods = Api::<Pod>::namespaced(client, namespace)
        .list(&ListParams::default())
        .await?
        .items
        .into_iter()
        .collect::<Vec<_>>();

    Ok(Response { data: json!(pods) })
}
