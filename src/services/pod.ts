import { invoker } from "../core";
import { OkMessage } from "./constant";

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
      image: string;
      state: Record<string, string>;
    }[];
  };
  spec: {
    containers: {
      name: string;
      args: string[];
      env?: {
        name: string;
        value?: string;
        valueFrom?: { secretKeyRef: { key: string; name: string } };
      }[];
      image: string;
      ports?: { containerPort: number; name: string; protocol: string }[];
    }[];
  };
}

export const listPods = async (namespace: string) => {
  return invoker<Pod[]>("list_pods", { namespace });
};

export const deletePod = async (namespace: string, name: string) => {
  return invoker<OkMessage>("delete_pod", { namespace, name });
};

export const startLogStream = async (
  namespace: string,
  podName: string,
  containerName: string
) => {
  return invoker<{ event: string; futureId: string }>("start_log_stream", {
    namespace,
    podName,
    containerName,
  });
};

export const startExecStream = async (
  namespace: string,
  podName: string,
  containerName: string
) => {
  return invoker<{
    futureId: string;
    stdinEvent: string;
    stdoutEvent: string;
    prompt: string;
  }>("start_exec_stream", {
    namespace,
    podName,
    containerName,
  });
};

export const startPortforward = async (
  namespace: string,
  name: string,
  containerPort: number,
  localPort: number
) => {
  return invoker<{ futureId: string }>("start_portforward", {
    namespace,
    name,
    containerPort,
    localPort,
  });
};
