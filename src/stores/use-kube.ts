import { createWithSignal } from "solid-zustand";

interface KubeState {
  context: string;
  namespace: string;
}

interface KubeActions {
  setContext: (context: string) => void;
  setNamespace: (namespace: string) => void;
}

export const useKubeStore = createWithSignal<KubeState & KubeActions>(
  (set) => ({
    context: "",
    namespace: "",
    setContext: (context) => set(() => ({ context: context })),
    setNamespace: (namespace) => set(() => ({ namespace: namespace })),
  }),
);
