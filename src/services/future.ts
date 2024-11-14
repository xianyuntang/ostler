import { invoker } from "../core";
import { OkMessage } from "./constant";

export const stopFuture = async (id: string) => {
  return invoker<OkMessage>("stop_future", {
    id,
  });
};
