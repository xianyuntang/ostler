import { invoker } from "../core";
import { OkMessage } from "./constant.ts";

export const addContext = async (filePath: string) => {
  return invoker<OkMessage>("add_context", { filePath });
};

export const removeContext = async (context: string) => {
  return invoker<OkMessage>("remove_context", { context });
};

export const listContexts = async () => {
  return invoker<{
    contexts: string[];
  }>("list_contexts");
};

export const switchContext = async (context: string) => {
  return invoker<OkMessage>("switch_context", {
    context,
  });
};
