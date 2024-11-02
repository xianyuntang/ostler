mod domain;
mod infrastructure;

use crate::domain::client::client_manager::ClientManager;
use crate::domain::portforward::portforward_manager::PortforwardManager;
use crate::domain::resources::contexts::commands::{
    add_context, list_contexts, remove_context, switch_context,
};
use crate::domain::resources::deployments::commands::list_deployments;
use crate::domain::resources::namespaces::commands::list_namespaces;
use crate::domain::resources::pods::commands::{get_pod_logs, list_pods};
use crate::domain::resources::portforward::commands::{start_portforward, stop_portforward};

use crate::infrastructure::app::AppData;
use tauri::async_runtime::Mutex;
use tauri::Manager;
use tauri_plugin_store::StoreExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Warn)
                .level_for("ostler_lib", log::LevelFilter::Trace)
                .max_file_size(500_000 /* bytes */)
                .build(),
        )
        .setup(|app| {
            let store = app.store("store.json")?;
            let client_manager = if let Some(kubeconfig_contents) = store.get("kubeconfig_contents")
            {
                let kubeconfig_contents: Vec<String> = serde_json::from_value(kubeconfig_contents)?;
                ClientManager::from_vec(&kubeconfig_contents)
            } else {
                ClientManager::new()
            };

            app.manage(Mutex::new(AppData {
                store,
                client_manager,
                portforward_manager: PortforwardManager::new(),
            }));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_contexts,
            switch_context,
            add_context,
            remove_context,
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
