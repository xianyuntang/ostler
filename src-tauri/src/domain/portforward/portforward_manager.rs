use crate::infrastructure::error::ApiError;
use dashmap::DashMap;
use kube::{api::Portforward, Api};
use serde::de::DeserializeOwned;
use std::{net::SocketAddr, sync::Arc};

use tokio::{io::AsyncWriteExt, net::TcpSocket, task::JoinHandle};

pub struct PortforwardManager {
    handles: DashMap<String, JoinHandle<Result<(), ApiError>>>,
}

impl PortforwardManager {
    pub fn new() -> Self {
        Self {
            handles: DashMap::new(),
        }
    }
}

impl PortforwardManager {
    pub async fn start_portforward<T: Clone + DeserializeOwned + Portforward + 'static>(
        &self,
        api: Api<T>,
        name: String,
        container_port: u16,
        local_port: u16,
    ) -> Result<(), ApiError> {
        let socket = TcpSocket::new_v4()?;
        socket.set_reuseaddr(false)?;
        socket.bind(format!("127.0.0.1:{}", local_port).parse::<SocketAddr>()?)?;

        let listener = socket.listen(1024)?;

        let api_arc = Arc::new(api);
        let name_arc = Arc::new(name.clone());

        let handle = tokio::spawn(async move {
            loop {
                match listener.accept().await {
                    Ok((socket, _)) => {
                        let api_clone = Arc::clone(&api_arc);
                        let name_clone = Arc::clone(&name_arc);
                        tokio::spawn(async move {
                            let mut pf = api_clone
                                .portforward(&name_clone, &[container_port])
                                .await?;
                            let stream = pf.take_stream(container_port).ok_or(ApiError::Io(
                                std::io::Error::new(
                                    std::io::ErrorKind::Other,
                                    "Cannot take stream",
                                ),
                            ))?;
                            let (mut pod_reader, mut pod_writer) = tokio::io::split(stream);
                            let (mut socket_reader, mut socket_writer) = tokio::io::split(socket);

                            let client_to_pod = tokio::spawn(async move {
                                tokio::io::copy(&mut socket_reader, &mut pod_writer).await?;
                                pod_writer.shutdown().await?;
                                Ok::<(), ApiError>(())
                            });

                            let pod_to_client = tokio::spawn(async move {
                                tokio::io::copy(&mut pod_reader, &mut socket_writer).await?;
                                socket_writer.shutdown().await?;

                                Ok::<(), ApiError>(())
                            });

                            let (res1, res2) = tokio::join!(client_to_pod, pod_to_client);
                            res1??;
                            res2??;
                            Ok::<(), ApiError>(())
                        });
                    }
                    Err(e) => {
                        tracing::error!("Error accepting connection: {:?}", e);
                        break;
                    }
                }
            }
            Ok::<(), ApiError>(())
        });

        self.handles.insert(name.clone(), handle);

        Ok(())
    }

    pub fn stop_portforward(&self, name: &str) {
        if let Some(handle) = self.handles.remove(name) {
            handle.1.abort();
        }
    }
}
