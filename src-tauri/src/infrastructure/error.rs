use std::string::FromUtf8Error;

use kube;
use log;
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),

    #[error(transparent)]
    Boxed(#[from] Box<dyn std::error::Error + Send + Sync>),

    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    Kube(#[from] kube::Error),

    #[error(transparent)]
    Kubeconfig(#[from] kube::config::KubeconfigError),

    #[error(transparent)]
    Join(#[from] tokio::task::JoinError),

    #[error(transparent)]
    AddrParse(#[from] std::net::AddrParseError),

    #[error(transparent)]
    SerdeJson(#[from] serde_json::Error),

    #[error(transparent)]
    SerdeYaml(#[from] serde_yaml::Error),

    #[error(transparent)]
    FromUtf8Error(#[from] FromUtf8Error),

    #[error(transparent)]
    SendError(#[from] futures::channel::mpsc::SendError),

    #[error("The specified {item} was not found.")]
    NotFound { item: String },
}

impl serde::Serialize for ApiError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        let error = serde_json::to_string(&json!({ "error": self.to_string() }))
            .expect("Failed to serialize JSON");

        log::error!("{error}");

        serializer.serialize_str(&error)
    }
}
