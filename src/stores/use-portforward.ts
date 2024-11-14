import { createWithSignal } from "solid-zustand";
import { immer } from "zustand/middleware/immer";

interface PortforwardState {
  portforward: Record<string, boolean>;
}

interface PortforwardActions {
  add: (
    context: string,
    namespace: string,
    pod: string,
    container: string,
  ) => void;
  remove: (
    context: string,
    namespace: string,
    pod: string,
    container: string,
  ) => void;
}

export const usePortforwardStore = createWithSignal<
  PortforwardState & PortforwardActions
>()(
  immer((set) => ({
    portforward: {},
    add: (context, namespace, pod, container) =>
      set((state) => {
        state.portforward[`${context}-${namespace}-${pod}-${container}`] = true;
      }),
    remove: (context, namespace, pod, container) =>
      set((state) => {
        state.portforward[`${context}-${namespace}-${pod}-${container}`] =
          false;
      }),
  })),
);
