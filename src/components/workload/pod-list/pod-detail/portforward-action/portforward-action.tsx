import { createShortcut } from "@solid-primitives/keyboard";
import ArrowForwardOutlinedIcon from "@suid/icons-material/ArrowForwardOutlined";
import { Box, IconButton } from "@suid/material";
import { green, grey } from "@suid/material/colors";
import { Component, createSignal, Show } from "solid-js";

import { portforwardService } from "../../../../../services";
import { Pod } from "../../../../../services/pod.ts";
import { useKubeStore, usePortforwardStore } from "../../../../../stores";
import PortforwardDialog from "./portforward-dialog";

interface PortforwardActionProps {
  podName: string;
  containerName: string;
  ports: Pod["spec"]["containers"][0]["ports"];
}

const PortforwardAction: Component<PortforwardActionProps> = (props) => {
  const [open, setOpen] = createSignal<boolean>(false);

  const context = useKubeStore((state) => state.context);
  const namespace = useKubeStore((state) => state.namespace);
  const portforward = usePortforwardStore((state) => state.portforward);
  const remove = usePortforwardStore((state) => state.remove);

  createShortcut(["ESCAPE"], () => {
    handleClose();
  });

  const isPortforwardRunning = () =>
    portforward()[
      `${context()}-${namespace()}-${props.podName}-${props.containerName}`
    ];

  const handleOpen = async () => {
    if (isPortforwardRunning()) {
      await portforwardService.stop_portforward(
        namespace(),
        "pod",
        props.podName,
      );
      remove(context(), namespace(), props.podName, props.containerName);
    } else {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getButtonColor = () => {
    if (props.ports?.length === 0) {
      return grey[500];
    } else if (isPortforwardRunning()) {
      return green[500];
    }
  };

  return (
    <Box>
      <IconButton onclick={handleOpen} disabled={props.ports?.length === 0}>
        <ArrowForwardOutlinedIcon
          sx={{ color: getButtonColor() }}
          color="primary"
        />
      </IconButton>
      <Show when={props.ports} keyed>
        {(ports) => (
          <PortforwardDialog
            open={open()}
            onClose={handleClose}
            podName={props.podName}
            containerName={props.containerName}
            ports={ports}
          />
        )}
      </Show>
    </Box>
  );
};

export default PortforwardAction;
