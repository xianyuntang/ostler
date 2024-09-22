use kube::config::{KubeConfigOptions, Kubeconfig};
use kube::{Client, Config};

pub struct ClientManager {
    kubeconfig: Kubeconfig,
    current_context: String,
}

impl ClientManager {
    pub fn new() -> Self {
        let kubeconfig = Kubeconfig::from_env()
            .expect("KUBECONFIG env not found.")
            .expect("KUBECONFIG is empty.");

        Self {
            kubeconfig: kubeconfig.clone(),
            current_context: kubeconfig.current_context.unwrap(),
        }
    }
}

impl ClientManager {
    pub async fn list_available_contexts(&self) -> Vec<String> {
        self.kubeconfig
            .contexts
            .iter()
            .map(|context| context.name.clone())
            .collect()
    }

    pub fn get_current_context(&self) -> String {
        self.current_context.clone()
    }

    pub async fn switch_context(&mut self, context: String) {
        tracing::info!("KUBECONFIG {} has been loaded", context);
        self.current_context = context;
    }

    pub async fn get_client(&self) -> Client {
        let kubeconfig_option = KubeConfigOptions {
            context: Some(self.current_context.clone()),
            ..KubeConfigOptions::default()
        };

        let config = Config::from_kubeconfig(&kubeconfig_option)
            .await
            .expect("KUBECONFIG is not configurable.");

        Client::try_from(config).expect("Initiate kube client failed.")
    }
}
