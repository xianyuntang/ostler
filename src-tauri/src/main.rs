// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod domain;
mod infrastructure;

use crate::domain::client::client_manager::ClientManager;
use crate::domain::portforward::portforward_manager::PortforwardManager;
use crate::domain::resources::context::{list_contexts, switch_context};
use crate::domain::resources::deployment::list_deployments;
use crate::domain::resources::namespace::list_namespaces;
use crate::domain::resources::pod::{get_pod_logs, list_pods};
use crate::domain::resources::portforward::{start_portforward, stop_portforward};
use crate::infrastructure::app::AppData;
use tauri::async_runtime::Mutex;
use tracing::Level;

fn main() {
    tracing_subscriber::fmt()
        .with_max_level(Level::DEBUG)
        .init();
    tauri::Builder::default()
        .manage(Mutex::new(AppData {
            client_manager: ClientManager::new(),
            portforward_manager: PortforwardManager::new(),
        }))
        .invoke_handler(tauri::generate_handler![
            list_namespaces,
            list_deployments,
            list_contexts,
            switch_context,
            list_pods,
            get_pod_logs,
            start_portforward,
            stop_portforward,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
