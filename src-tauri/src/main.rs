// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod domain;
mod infrastructure;

use domain::resources::deployment::list_deployments;
use domain::resources::namespace::list_namespaces;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![list_namespaces, list_deployments])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
