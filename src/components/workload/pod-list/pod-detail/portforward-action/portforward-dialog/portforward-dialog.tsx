import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from "@suid/material";
import { ChangeEvent } from "@suid/types";
import { Component, createSignal, onMount } from "solid-js";

import { portforwardService } from "../../../../../../services";
import { Pod } from "../../../../../../services/pod.ts";
import { useKubeStore, usePortforwardStore } from "../../../../../../stores";

interface PortforwardDialogProps {
  open: boolean;
  onClose: () => void;
  podName: string;
  containerName: string;
  ports: NonNullable<Pod["spec"]["containers"][0]["ports"]>;
}

const PortforwardDialog: Component<PortforwardDialogProps> = (props) => {
  const [containerPort, setContainerPort] = createSignal<string>("");
  const [localPort, setLocalPort] = createSignal<string>("");

  const context = useKubeStore((state) => state.context);
  const namespace = useKubeStore((state) => state.namespace);
  const add = usePortforwardStore((state) => state.add);

  onMount(() => {
    setContainerPort(props.ports[0].containerPort.toString());
    setLocalPort(props.ports[0].containerPort.toString());
  });

  const handlePortforwardClick = async () => {
    await portforwardService.start_portforward(
      namespace(),
      "pod",
      props.podName,
      parseInt(containerPort()),
      parseInt(localPort()),
    );
    add(context(), namespace(), props.podName, props.containerName);
    props.onClose();
  };

  const handleContainerPortChange = (
    _: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
  ) => {
    setContainerPort(value);
  };

  const handleLocalPortChange = (
    _: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
  ) => {
    setLocalPort(value);
  };

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>Portforward</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <TextField
            label="Container Port"
            variant="standard"
            value={containerPort()}
            onChange={handleContainerPortChange}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Local Port"
            variant="standard"
            value={localPort()}
            onChange={handleLocalPortChange}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button onClick={handlePortforwardClick}>Start</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PortforwardDialog;
