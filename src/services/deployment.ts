import { invoker } from "../core";

export const listDeployments = async () => {
  return invoker<
    {
      apiVersion: string;
      Kind: string;
      metadata: {
        name: string;
        uid: string;
        labels: Record<string, string>;
        creationTimestamp: string;
      };
      status: { readyReplicas: number | null; replicas: number | null };
    }[]
  >("list_deployments");
};
