import { invoker } from "../core";

export const listNamespace = async () => {
  return invoker<
    {
      apiVersion: string;
      Kind: string;
      metadata: { name: string; uid: string; labels: Record<string, string> };
      status: { phase: string };
    }[]
  >("list_namespaces");
};
