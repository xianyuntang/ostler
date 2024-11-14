use std::collections::HashMap;
use tokio::task::JoinHandle;

use crate::infrastructure::error::ApiError;

pub struct FutureManager {
    handles: HashMap<String, JoinHandle<Result<(), ApiError>>>,
}

impl FutureManager {
    pub fn new() -> Self {
        Self {
            handles: HashMap::new(),
        }
    }
}

impl FutureManager {
    pub fn add(&mut self, id: String, handle: JoinHandle<Result<(), ApiError>>) {
        self.handles.entry(id.clone()).or_insert(handle);
    }

    pub fn abort(&mut self, id: &str) {
        if let Some(handle) = self.handles.remove(id) {
            handle.abort();
        }
    }
}
