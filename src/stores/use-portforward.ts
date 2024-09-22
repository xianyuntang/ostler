import { createWithSignal } from "solid-zustand";
import { immer } from "zustand/middleware/immer";

interface PortforwardState {
  portforward: Record<string, boolean>;
}

interface PortforwardActions {
  add: (name: string) => void;
  remove: (name: string) => void;
}

export const usePortforwardStore = createWithSignal<
  PortforwardState & PortforwardActions
>()(
  immer((set) => ({
    portforward: {},
    add: (name) =>
      set((state) => {
        state.portforward[name] = true;
      }),
    remove: (name) =>
      set((state) => {
        state.portforward[name] = false;
      }),
  })),
);
