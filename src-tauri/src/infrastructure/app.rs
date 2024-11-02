use crate::domain::client::client_manager::ClientManager;
use crate::domain::portforward::portforward_manager::PortforwardManager;
use std::sync::Arc;
use tauri::Wry;
use tauri_plugin_store::Store;

pub struct AppData {
    pub store: Arc<Store<Wry>>,
    pub client_manager: ClientManager,
    pub portforward_manager: PortforwardManager,
}
