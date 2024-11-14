mod domain;
mod infrastructure;

use crate::domain::client::client_manager::ClientManager;
use crate::domain::future::commands::stop_future;
use crate::domain::portforward::portforward_manager::PortforwardManager;
use crate::domain::resources::contexts::commands::{
    add_context, list_contexts, remove_context, switch_context,
};
use crate::domain::resources::deployments::commands::list_deployments;
use crate::domain::resources::namespaces::commands::list_namespaces;
use crate::domain::resources::pods::commands::{list_pods, start_exec_stream, start_log_stream};
use crate::domain::resources::portforward::commands::{start_portforward, stop_portforward};
use crate::infrastructure::app::AppData;
use domain::future::future_manager::FutureManager;
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
                log::info!("Loading kubeconfig file from store");
                let kubeconfig_contents: Vec<String> = serde_json::from_value(kubeconfig_contents)?;
                ClientManager::from_vec(&kubeconfig_contents)
            } else {
                ClientManager::new()
            };

            app.manage(Mutex::new(AppData {
                store,
                client_manager,
                portforward_manager: PortforwardManager::new(),
                future_manager: FutureManager::new(),
            }));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // context
            list_contexts,
            switch_context,
            add_context,
            remove_context,
            // namespace
            list_namespaces,
            // pod
            start_log_stream,
            list_pods,
            start_exec_stream,
            // deployment
            list_deployments,
            // other
            stop_future,
            start_portforward,
            stop_portforward
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
