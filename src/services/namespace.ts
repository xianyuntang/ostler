import { invoker } from "../core";

export const listNamespaces = async () => {
  return invoker<string[]>("list_namespaces");
};
