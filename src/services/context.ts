import { invoker } from "../core";

export const listContexts = async () => {
  return invoker<{ contexts: string[]; current: string }>("list_contexts");
};

export const switchContext = async (context: string) => {
  return invoker<{ message: "ok" }>("switch_context", { context: context });
};
