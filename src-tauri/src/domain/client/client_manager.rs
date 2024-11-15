use indexmap::IndexMap;
use kube::config::{KubeConfigOptions, Kubeconfig};
use kube::{Client, Config};

use crate::infrastructure::error::ApiError;

pub struct ClientManager {
    current_kubeconfig: Option<Kubeconfig>,
    available_kubeconfigs: IndexMap<String, Kubeconfig>,
}

impl ClientManager {
    pub fn new() -> Self {
        Self {
            current_kubeconfig: None,
            available_kubeconfigs: IndexMap::new(),
        }
    }
    pub fn from_vec(kubeconfig_contents: &Vec<String>) -> Self {
        let mut manager = Self::new();
        let _ = manager.add_all(kubeconfig_contents);
        manager
    }
}

impl ClientManager {
    pub fn add(&mut self, kubeconfig_content: &str) -> Result<(), ApiError> {
        if let Ok(kubeconfig) = Kubeconfig::from_yaml(kubeconfig_content) {
            let context = kubeconfig.contexts[0].clone();

            log::info!("{} was added ", context.name);
            self.available_kubeconfigs
                .entry(context.name)
                .or_insert(kubeconfig);
        }
        Ok(())
    }

    pub fn add_all(&mut self, kubeconfig_contents: &Vec<String>) -> Result<(), ApiError> {
        for kubeconfig_content in kubeconfig_contents {
            self.add(kubeconfig_content)?
        }

        Ok(())
    }

    pub fn remove(&mut self, context: &str) -> Result<(), ApiError> {
        self.available_kubeconfigs.shift_remove(context);
        Ok(())
    }

    pub fn to_vec(&self) -> Result<Vec<String>, ApiError> {
        let mut kubeconfig_contents = self
            .available_kubeconfigs
            .values()
            .map(serde_yaml::to_string)
            .collect::<Result<Vec<String>, _>>()?;

        kubeconfig_contents.sort();

        Ok(kubeconfig_contents)
    }
}

impl ClientManager {
    pub fn list_contexts(&self) -> Vec<String> {
        self.available_kubeconfigs.keys().cloned().collect()
    }

    pub fn switch_context(&mut self, context: &str) -> Result<(), ApiError> {
        log::debug!("KUBECONFIG {} has been loaded", context);
        if let Some(kubeconfig) = self.available_kubeconfigs.get(context) {
            self.current_kubeconfig = Some(kubeconfig.to_owned());
            return Ok(());
        }
        Err(ApiError::NotFound {
            item: format!("context '{}'", context),
        })
    }
}

impl ClientManager {
    pub async fn get_client(&self) -> Result<Client, ApiError> {
        if let Some(kubeconfig) = self.current_kubeconfig.clone() {
            if let Some(named_context) = kubeconfig.contexts.first() {
                log::debug!("Get kube client {}", named_context.name);
                let context_clone = named_context.context.clone().unwrap();
                let context = named_context.clone().name;
                let cluster = context_clone.cluster;
                let user = context_clone.user;
                let kubeconfig_option = KubeConfigOptions {
                    context: Some(context),
                    cluster: Some(cluster),
                    user: Some(user),
                };

                let mut config =
                    Config::from_custom_kubeconfig(kubeconfig, &kubeconfig_option).await?;
                config.accept_invalid_certs = true;
                return Ok(Client::try_from(config)?);
            };
        };
        Err(ApiError::NotFound {
            item: "client".to_string(),
        })
    }
}
