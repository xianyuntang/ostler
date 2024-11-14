import { createShortcut } from "@solid-primitives/keyboard";
import TerminalTwoToneIcon from "@suid/icons-material/TerminalTwoTone";
import { Box, IconButton } from "@suid/material";
import { createSignal, Show } from "solid-js";

import TerminalDialog from "./terminal-dialog/terminal-dialog.tsx";

interface ExecActionProps {
  podName: string;
  containerName: string;
}

const ExecAction = (props: ExecActionProps) => {
  const [open, setOpen] = createSignal<boolean>(false);

  createShortcut(["ESCAPE"], () => {
    handleClose();
  });

  const handleOpen = async () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <IconButton onclick={handleOpen}>
        <TerminalTwoToneIcon color="primary" />
      </IconButton>
      <Show when={open()}>
        <TerminalDialog
          onClose={handleClose}
          podName={props.podName}
          containerName={props.containerName}
        />
      </Show>
    </Box>
  );
};

export default ExecAction;
