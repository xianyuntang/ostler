import { invoker } from "../core";

export interface Deployment {
  apiVersion: string;
  Kind: string;
  metadata: {
    name: string;
    uid: string;
    labels: Record<string, string>;
    creationTimestamp: string;
    namespace: string;
  };
  status: { readyReplicas: number | null; replicas: number | null };
}

export const listDeployments = async (namespace: string) => {
  return invoker<Deployment[]>("list_deployments", { namespace });
};
