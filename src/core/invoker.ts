import { invoke } from "@tauri-apps/api/core";
import { InvokeArgs } from "@tauri-apps/api/core";

export const invoker = async <T>(
  command: string,
  args?: InvokeArgs,
): Promise<T> => {
  const { data } = await invoke<{ data: T }>(command, args);
  return data;
};
