import "@xterm/xterm/css/xterm.css";

import { FitAddon } from "@xterm/addon-fit";
import { Terminal as Xterm } from "@xterm/xterm";
import { Accessor, createSignal, onCleanup, onMount } from "solid-js";

interface TerminalProps {
  ref: Accessor<HTMLDivElement | undefined>;
}

export const useTerminal = ({ ref }: TerminalProps) => {
  const [terminal, setTerminal] = createSignal<Xterm | undefined>(undefined);

  onMount(() => {
    const containerRef = ref();
    if (containerRef) {
      const term = new Xterm({ cursorBlink: true, convertEol: true });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef);
      fitAddon.fit();

      const handleResize = () => fitAddon.fit();
      window.addEventListener("resize", handleResize);

      setTerminal(term);

      onCleanup(() => {
        window.removeEventListener("resize", handleResize);
        term.dispose();
      });
    }
  });

  return { terminal };
};
