import { createWithSignal } from "solid-zustand";

interface KubeState {
  context: string;
  namespace: string;
  setContext: (context: string) => void;
  setNamespace: (namespace: string) => void;
}

export const useKubeStore = createWithSignal<KubeState>((set) => ({
  context: "",
  namespace: "",
  setContext: (context) => set(() => ({ context: context })),
  setNamespace: (namespace) => set(() => ({ namespace: namespace })),
}));
