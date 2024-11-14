use crate::infrastructure::error::ApiError;
use nanoid::nanoid;
use std::collections::HashMap;
use tokio::task::JoinHandle;

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
    pub fn add(&mut self, handle: JoinHandle<Result<(), ApiError>>) -> String {
        let id = nanoid!();
        self.handles.entry(id.clone()).or_insert(handle);

        id
    }

    pub fn abort(&mut self, id: &str) {
        if let Some(handle) = self.handles.remove(id) {
            handle.abort();
        }
    }
}
