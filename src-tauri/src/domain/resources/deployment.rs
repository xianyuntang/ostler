use crate::infrastructure::app::AppData;
use crate::infrastructure::error::Error;
use crate::infrastructure::response::Response;
use k8s_openapi::api::apps::v1::Deployment;
use kube::api::ListParams;
use kube::Api;
use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::State;

#[tauri::command]
pub async fn list_deployments(state: State<'_, Mutex<AppData>>) -> Result<Response, Error> {
    tracing::info!("list_deployments called");

    let client = state.lock().await.client_manager.get_client().await;

    let deployments = Api::<Deployment>::all(client)
        .list(&ListParams::default())
        .await?
        .items
        .into_iter()
        .collect::<Vec<_>>();
    Ok(Response {
        data: json!(deployments),
    })
}
