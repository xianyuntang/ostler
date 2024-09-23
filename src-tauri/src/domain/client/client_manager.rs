use kube::config::{KubeConfigOptions, Kubeconfig};
use kube::{Client, Config};

pub struct ClientManager {
    kubeconfig: Kubeconfig,
    current_kubeconfig_index: usize,
}

impl ClientManager {
    pub fn new() -> Self {
        let kubeconfig = Kubeconfig::from_env()
            .expect("KUBECONFIG env not found.")
            .expect("KUBECONFIG is empty.");

        Self {
            kubeconfig: kubeconfig.clone(),
            current_kubeconfig_index: 0,
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
        self.kubeconfig.contexts[self.current_kubeconfig_index]
            .name
            .clone()
    }

    pub async fn switch_context(&mut self, context: &str) {
        tracing::info!("KUBECONFIG {} has been loaded", context);
        if let Some((index, _)) = self
            .kubeconfig
            .contexts
            .iter()
            .enumerate()
            .find(|(_, named_context)| named_context.name == context)
        {
            self.current_kubeconfig_index = index;
        }
    }
}

impl ClientManager {
    pub async fn get_client(&self) -> Client {
        let kubeconfig_option = KubeConfigOptions {
            context: Some(
                self.kubeconfig.contexts[self.current_kubeconfig_index]
                    .name
                    .clone(),
            ),
            cluster: Some(
                self.kubeconfig.clusters[self.current_kubeconfig_index]
                    .name
                    .clone(),
            ),
            ..KubeConfigOptions::default()
        };

        let config = Config::from_kubeconfig(&kubeconfig_option)
            .await
            .expect("KUBECONFIG is not configurable.");

        Client::try_from(config).expect("Initiate kube client failed.")
    }
}
