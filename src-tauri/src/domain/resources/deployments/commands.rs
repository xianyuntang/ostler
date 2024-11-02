use crate::domain::client::api_helper::get_api;
use crate::infrastructure::app::AppData;
use crate::infrastructure::error::ApiError;
use crate::infrastructure::response::Response;
use k8s_openapi::api::apps::v1::Deployment;
use kube::api::ListParams;
use log;
use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::State;

#[tauri::command]
pub async fn list_deployments(
    state: State<'_, Mutex<AppData>>,
    namespace: &str,
) -> Result<Response, ApiError> {
    log::info!("list_deployments called");

    let client = state.lock().await.client_manager.get_client().await?;

    let api = get_api::<Deployment>(client, namespace);

    let deployments = api
        .list(&ListParams::default())
        .await?
        .items
        .into_iter()
        .collect::<Vec<_>>();

    Ok(Response {
        data: json!(deployments),
    })
}
