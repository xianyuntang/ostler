// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::domain::resources::namespace::list_namespaces;

mod domain;
mod infrastructure;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![list_namespaces])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
