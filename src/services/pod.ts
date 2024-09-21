import { invoker } from "../core";
export interface Pod {
  apiVersion: string;
  Kind: string;
  metadata: {
    name: string;
    uid: string;
    labels: Record<string, string>;
    creationTimestamp: string;
    namespace: string;
  };
  status: {
    containerStatuses: {
      name: string;
      ready: boolean;
      restartCount: number;
    }[];
  };
}
export const listPods = async (namespace: string) => {
  const r = await invoker<Pod[]>("list_pods", { namespace });
  return r;
};
