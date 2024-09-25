use k8s_openapi::NamespaceResourceScope;
use kube::{Api, Client, Resource};

pub fn get_api<K: Resource<DynamicType = (), Scope = NamespaceResourceScope>>(
    client: Client,
    namespace: &str,
) -> Api<K> {
    match namespace {
        "" => Api::<K>::all(client),
        _ => Api::<K>::namespaced(client, namespace),
    }
}
