import { createWithSignal } from "solid-zustand";

interface KubeContextState {
  context: string;
  setContext: (context: string) => void;
}

export const useKubeContextStore = createWithSignal<KubeContextState>(
  (set) => ({
    context: "",
    setContext: (context) => set(() => ({ context: context })),
  }),
);
