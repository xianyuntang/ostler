import { invoker } from "../core";

export interface NamedContext {
  context: { cluste: string; user: string; namespace: string };
  name: string;
}

export const listContexts = async () => {
  return invoker<{
    contexts: NamedContext[];
    current: NamedContext;
  }>("list_contexts");
};

export const switchContext = async (context: string) => {
  return invoker<{ namedContext: NamedContext }>("switch_context", {
    context: context,
  });
};
