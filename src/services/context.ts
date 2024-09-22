import { invoker } from "../core";
import { OkMessage } from "./constant.ts";

export const listContexts = async () => {
  return invoker<{ contexts: string[]; current: string }>("list_contexts");
};

export const switchContext = async (context: string) => {
  return invoker<OkMessage>("switch_context", { context: context });
};
