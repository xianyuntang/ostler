use home::home_dir;
use kube::config::{KubeConfigOptions, Kubeconfig, NamedContext};
use kube::{Client, Config};
use std::fs::File;
use std::io::BufReader;

pub struct ClientManager {
    kubeconfig: Kubeconfig,
    current_kubeconfig_index: usize,
}

impl ClientManager {
    pub fn new() -> Self {
        let mut kubeconfig = Kubeconfig::from_env().expect("KUBECONFIG env not found.");

        if let Some(home) = home_dir() {
            let kubeconfig_path = home.join(".kube").join("config");
            let file = File::open(kubeconfig_path.clone()).unwrap_or_else(|_| {
                panic!(
                    "Failed to open file: {}",
                    kubeconfig_path
                        .to_str()
                        .expect("Failed to convert path to string")
                )
            });

            let reader = BufReader::new(file);
            let yaml: Kubeconfig = serde_yaml::from_reader(reader).expect("Failed to parse YAML");

            kubeconfig = Some(yaml)
        }

        let kubeconfig = kubeconfig.clone().unwrap();

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
