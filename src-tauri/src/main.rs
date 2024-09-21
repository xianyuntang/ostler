// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod domain;
mod infrastructure;

use crate::domain::resources::client_manager::ClientManager;
use crate::domain::resources::context::{list_contexts, switch_context};
use crate::domain::resources::deployment::list_deployments;
use crate::domain::resources::namespace::list_namespaces;
use crate::domain::resources::pod::list_pods;
use crate::infrastructure::app::AppData;
use tauri::async_runtime::Mutex;

fn main() {
    tracing_subscriber::fmt::init();
    tauri::Builder::default()
        .manage(Mutex::new(AppData {
            client_manager: ClientManager::new(),
        }))
        .invoke_handler(tauri::generate_handler![
            list_namespaces,
            list_deployments,
            list_contexts,
            switch_context,
            list_pods,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
