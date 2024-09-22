use crate::domain::client::client_manager::ClientManager;
use crate::domain::portforward::portforward_manager::PortforwardManager;

pub struct AppData {
    pub client_manager: ClientManager,
    pub portforward_manager: PortforwardManager,
}
