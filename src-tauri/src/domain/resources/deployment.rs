use crate::infrastructure::error::Error;
use crate::infrastructure::response::Response;
use k8s_openapi::api::apps::v1::Deployment;
use kube::api::ListParams;
use kube::{Api, Client};
use serde_json::json;

#[tauri::command]
pub async fn list_deployments() -> Result<Response, Error> {
    let client = Client::try_default().await?;

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
