import { invoker } from "../core";

export const listNamespaces = async () => {
  return invoker<{ namespaces: string[]; default: string }>("list_namespaces");
};
