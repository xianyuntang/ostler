use serde::Serialize;
use serde_json::Value;

#[derive(Serialize)]
pub struct Response {
    pub(crate) data: Value,
}