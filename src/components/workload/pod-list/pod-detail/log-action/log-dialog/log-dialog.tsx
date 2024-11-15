import { Box, Dialog, DialogContent } from "@suid/material";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { Component, createSignal, onCleanup, onMount } from "solid-js";

import { futureService, podService } from "../../../../../../services";
import { useKubeStore } from "../../../../../../stores";
import DialogBar from "../../../../../shared/terminal/dialog-bar";
import { useTerminal } from "../../../../../shared/terminal/terminal";

interface LogDialogProps {
  onClose: () => void;
  podName: string;
  containerName: string;
}

const LogDialog: Component<LogDialogProps> = (props) => {
  const [containerRef, setContainerRef] = createSignal<
    HTMLDivElement | undefined
  >(undefined);

  const namespace = useKubeStore((state) => state.namespace);

  const { terminal } = useTerminal({ ref: containerRef });

  onMount(() => {
    const term = terminal();

    let event: string;
    let futureId: string;
    let unlisten: UnlistenFn;

    (async () => {
      if (term) {
        ({ event, futureId } = await podService.startLogStream(
          namespace(),
          props.podName,
          props.containerName
        ));

        unlisten = await listen<string>(event, (event) => {
          term.writeln(event.payload);
        });
      }
    })();

    onCleanup(() => {
      if (futureId && unlisten) {
        unlisten();
        void futureService.stopFuture(futureId);
      }
    });
  });

  return (
    <Dialog fullScreen open onClose={props.onClose}>
      <DialogBar title="Log" onClose={props.onClose} />
      <DialogContent>
        <Box height="calc(100% - 40px)" width="100%">
          <Box ref={setContainerRef} height="100%" width="100%" />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LogDialog;
