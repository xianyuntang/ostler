use kube::config::{KubeConfigOptions, Kubeconfig, NamedContext};
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
    pub async fn list_available_contexts(&self) -> Vec<NamedContext> {
        self.kubeconfig.contexts.clone()
    }

    pub fn get_current_context(&self) -> NamedContext {
        self.kubeconfig.contexts[self.current_kubeconfig_index].clone()
    }

    pub async fn switch_context(&mut self, context: &str) -> NamedContext {
        tracing::info!("KUBECONFIG {} has been loaded", context);
        if let Some((index, _)) = self
            .kubeconfig
            .contexts
            .iter()
            .enumerate()
            .find(|(_, named_context)| named_context.name == context)
        {
            self.current_kubeconfig_index = index;
            return self.kubeconfig.contexts[index].clone();
        }

        self.kubeconfig.contexts[self.current_kubeconfig_index].clone()
    }
}

impl ClientManager {
    pub async fn get_client(&self) -> Client {
        let named_context = self.kubeconfig.contexts[self.current_kubeconfig_index].clone();

        let context_clone = named_context.context.clone().unwrap();
        let context = named_context.name;
        let cluster = context_clone.cluster;
        let user = context_clone.user;

        let kubeconfig_option = KubeConfigOptions {
            context: Some(context),
            cluster: Some(cluster),
            user: Some(user),
        };

        let config = Config::from_kubeconfig(&kubeconfig_option)
            .await
            .expect("KUBECONFIG is not configurable.");

        Client::try_from(config).expect("Initiate kube client failed.")
    }
}
