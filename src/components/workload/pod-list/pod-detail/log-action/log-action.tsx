import { createShortcut } from "@solid-primitives/keyboard";
import ArticleTwoToneIcon from "@suid/icons-material/ArticleTwoTone";
import { Box, IconButton } from "@suid/material";
import { Component, createSignal, Show } from "solid-js";

import LogDialog from "./log-dialog";

interface LogActionProps {
  podName: string;
  containerName: string;
}

const LogAction: Component<LogActionProps> = (props) => {
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
        <ArticleTwoToneIcon color="primary" />
      </IconButton>
      <Show when={open()}>
        <LogDialog
          onClose={handleClose}
          podName={props.podName}
          containerName={props.containerName}
        />
      </Show>
    </Box>
  );
};

export default LogAction;
