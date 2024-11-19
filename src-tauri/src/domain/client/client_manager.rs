use std::str::FromStr;

use indexmap::IndexMap;
use kube::config::{KubeConfigOptions, Kubeconfig};
use kube::{Client, Config};
use nanoid::nanoid;

use crate::domain::client::kubeconfig_key::KubeconfigKey;
use crate::infrastructure::error::ApiError;

pub struct ClientManager {
    current_kubeconfig: Option<KubeconfigKey>,
    kubeconfig_contents: IndexMap<String, Kubeconfig>,
    available_configs: IndexMap<KubeconfigKey, Config>,
}

impl ClientManager {
    pub fn new() -> Self {
        Self {
            current_kubeconfig: None,
            kubeconfig_contents: IndexMap::new(),
            available_configs: IndexMap::new(),
        }
    }
    pub fn from_vec(kubeconfig_contents: &Vec<String>) -> Self {
        let mut manager = Self::new();

        let runtime = tokio::runtime::Runtime::new().unwrap();
        runtime.block_on(async {
            let _ = manager.add_all(kubeconfig_contents).await;
        });

        manager
    }
}

impl ClientManager {
    pub async fn add(&mut self, kubeconfig_content: &str) -> Result<(), ApiError> {
        if let Ok(kubeconfig) = Kubeconfig::from_yaml(kubeconfig_content) {
            let cloned_named_contexts = kubeconfig.contexts.clone();

            for named_context in cloned_named_contexts {
                let named_context_clone = named_context.clone();
                let context = named_context_clone.name;
                let user = named_context_clone.context.clone().unwrap().user;
                let cluster = named_context_clone.context.clone().unwrap().cluster;

                let kubeconfig_option = KubeConfigOptions {
                    context: Some(context.clone()),
                    cluster: Some(cluster.clone()),
                    user: Some(user.clone()),
                };
                let mut config =
                    Config::from_custom_kubeconfig(kubeconfig.clone(), &kubeconfig_option).await?;
                config.accept_invalid_certs = true;
                println!("{:#?}", config);
                log::info!("add config context: {context} cluster: {cluster} user: {user}");
                self.available_configs
                    .entry(KubeconfigKey(context, user))
                    .or_insert(config);
            }
            self.kubeconfig_contents
                .entry(nanoid!())
                .or_insert(kubeconfig);
        };
        Ok(())
    }

    pub async fn add_all(&mut self, kubeconfig_contents: &Vec<String>) -> Result<(), ApiError> {
        for kubeconfig_content in kubeconfig_contents {
            println!("{}", kubeconfig_content);
            self.add(kubeconfig_content).await?
        }

        Ok(())
    }

    pub fn to_vec(&self) -> Result<Vec<String>, ApiError> {
        let mut kubeconfig_contents = self
            .kubeconfig_contents
            .values()
            .map(serde_yaml::to_string)
            .collect::<Result<Vec<String>, _>>()?;

        kubeconfig_contents.sort();

        Ok(kubeconfig_contents)
    }
}

impl ClientManager {
    pub fn list_contexts(&self) -> Vec<String> {
        self.available_configs
            .keys()
            .cloned()
            .map(|key| key.to_string())
            .collect()
    }

    pub fn switch_context(&mut self, kubeconfig_key: &str) -> Result<(), ApiError> {
        let kubeconfig_key = KubeconfigKey::from_str(kubeconfig_key)?;
        log::debug!("KUBECONFIG {:?} has been loaded", kubeconfig_key);
        if self.available_configs.get(&kubeconfig_key).is_some() {
            self.current_kubeconfig = Some(kubeconfig_key.clone());
            return Ok(());
        }
        Err(ApiError::NotFound {
            item: format!("context '{:#?}'", kubeconfig_key),
        })
    }
}

impl ClientManager {
    pub async fn get_client(&self) -> Result<Client, ApiError> {
        if let Some(kubeconfig_key) = self.current_kubeconfig.clone() {
            if let Some(config) = self.available_configs.get(&kubeconfig_key) {
                return Ok(Client::try_from(config.clone())?);
            };
        };
        Err(ApiError::NotFound {
            item: "client".to_string(),
        })
    }
}
