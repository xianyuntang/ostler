import { invoke } from "@tauri-apps/api";
import { InvokeArgs } from "@tauri-apps/api/tauri";

export const invoker = async <T>(
  command: string,
  args?: InvokeArgs
): Promise<T> => {
  const { data } = await invoke<{ data: T }>(command, args);
  return data;
};
