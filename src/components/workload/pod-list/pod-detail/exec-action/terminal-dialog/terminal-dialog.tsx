import CloseTwoToneIcon from "@suid/icons-material/CloseTwoTone";
import {
  AppBar,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Toolbar,
  Typography,
} from "@suid/material";
import { emit, listen, UnlistenFn } from "@tauri-apps/api/event";
import { createSignal, onCleanup, onMount } from "solid-js";

import { futureService, podService } from "../../../../../../services";
import { useKubeStore } from "../../../../../../stores";
import { useTerminal } from "../../../terminal";

interface TerminalDialogProps {
  onClose: () => void;
  podName: string;
  containerName: string;
}

const TerminalDialog = (props: TerminalDialogProps) => {
  const [containerRef, setContainerRef] = createSignal<
    HTMLDivElement | undefined
  >(undefined);

  const namespace = useKubeStore((state) => state.namespace);
  const { terminal } = useTerminal({ ref: containerRef });

  onMount(() => {
    const term = terminal();
    const ref = containerRef();

    let futureId: string;
    let stdinEvent: string;
    let stdoutEvent: string;
    let unlisten: UnlistenFn;

    (async () => {
      if (ref && term) {
        ({ futureId, stdoutEvent, stdinEvent } =
          await podService.startExecStream(
            namespace(),
            props.podName,
            props.containerName
          ));

        unlisten = await listen<{ message: string }>(stdoutEvent, (evt) => {
          term.write(evt.payload.message);
        });

        term.onData((data) => {
          emit(stdinEvent, { key: data });
        });

        term.focus();
      }
    })();
    onCleanup(async () => {
      if (futureId && unlisten) {
        unlisten();
        await futureService.stopFuture(futureId);
      }
    });
  });

  return (
    <Dialog fullScreen open onClose={props.onClose}>
      <AppBar position="static">
        <Toolbar>
          <IconButton onClick={props.onClose}>
            <CloseTwoToneIcon sx={{ color: "white" }} color="primary" />
          </IconButton>
          <Typography
            sx={{
              ml: 2,
              flex: 1,
            }}
            variant="h6"
          >
            Terminal
          </Typography>
        </Toolbar>
      </AppBar>

      <DialogContent>
        <Box ref={setContainerRef} height="calc(100% - 40px)" width="100%" />
      </DialogContent>
    </Dialog>
  );
};

export default TerminalDialog;
