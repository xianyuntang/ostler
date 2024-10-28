mod domain;
mod infrastructure;

use crate::domain::client::client_manager::ClientManager;
use crate::domain::portforward::portforward_manager::PortforwardManager;
use crate::domain::resources::contexts::commands::{list_contexts, switch_context};
use crate::domain::resources::deployments::commands::list_deployments;
use crate::domain::resources::namespaces::commands::list_namespaces;
use crate::domain::resources::pods::commands::{get_pod_logs, list_pods};
use crate::domain::resources::portforward::commands::{start_portforward, stop_portforward};

use crate::infrastructure::app::AppData;
use tauri::async_runtime::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Warn)
                .level_for("ostler_lib", log::LevelFilter::Trace)
                .max_file_size(500_000 /* bytes */)
                .build(),
        )
        .setup(|app| {
            app.manage(Mutex::new(AppData {
                client_manager: ClientManager::new(),
                portforward_manager: PortforwardManager::new(),
            }));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_contexts,
            switch_context,
            list_namespaces,
            get_pod_logs,
            list_pods,
            list_deployments,
            start_portforward,
            stop_portforward
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
