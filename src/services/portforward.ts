import { invoker } from "../core";
import { OkMessage } from "./constant";

export const start_portforward = async (
  namespace: string,
  resource: "pod" | "service",
  name: string,
  containerPort: number,
  localPort: number
) => {
  return invoker<OkMessage>("start_portforward", {
    namespace,
    resource,
    name,
    containerPort,
    localPort,
  });
};

export const stop_portforward = async (name: string) => {
  return invoker<OkMessage>("stop_portforward", { name });
};
