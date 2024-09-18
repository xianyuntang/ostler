use crate::infrastructure::error::Error;
use crate::infrastructure::response::Response;
use k8s_openapi::api::core::v1::Namespace;
use kube::api::ListParams;
use kube::{Api, Client};
use serde_json::json;

#[tauri::command]
pub async fn list_namespaces() -> Result<Response, Error> {
    let client = Client::try_default().await?;

    let namespaces = Api::<Namespace>::all(client)
        .list(&ListParams::default())
        .await?
        .items
        .into_iter()
        .collect::<Vec<_>>();

    Ok(Response {
        data: json!(namespaces),
    })
}
