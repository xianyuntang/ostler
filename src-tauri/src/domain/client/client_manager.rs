use home::home_dir;
use kube::config::{KubeConfigOptions, Kubeconfig, NamedContext};
use kube::{Client, Config};
use log;
use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;

pub struct ClientManager {
    kubeconfig: Kubeconfig,
    current_kubeconfig_index: usize,
}

impl ClientManager {
    pub fn new() -> Self {
        let kubeconfig = Kubeconfig::from_env().unwrap();

        let kubeconfig = kubeconfig.unwrap_or_else(|| {
            let path = Self::get_kubeconfig_path();
            Self::load_kubeconfig_from_file(&path)
        });

        Self {
            kubeconfig,
            current_kubeconfig_index: 0,
        }
    }

    fn get_kubeconfig_path() -> PathBuf {
        home_dir().unwrap().join(".kube").join("config")
    }

    fn load_kubeconfig_from_file(path: &PathBuf) -> Kubeconfig {
        let file = File::open(path).unwrap_or_else(|_| {
            panic!(
                "Failed to open file: {}",
                path.to_str().expect("Failed to convert path to string")
            )
        });

        let reader = BufReader::new(file);
        serde_yaml::from_reader(reader).expect("Failed to parse YAML")
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
        log::info!("KUBECONFIG {} has been loaded", context);
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

        log::debug!("context={}, cluster={}, user={}", context, cluster, user);

        let kubeconfig_option = KubeConfigOptions {
            context: Some(context),
            cluster: Some(cluster),
            user: Some(user),
        };

        let mut config = Config::from_kubeconfig(&kubeconfig_option)
            .await
            .expect("KUBECONFIG is not configurable.");

        config.accept_invalid_certs = true;

        Client::try_from(config).expect("Initiate kube client failed.")
    }
}
