import { Dialog, DialogContent, TextField } from "@suid/material";
import { createQuery } from "@tanstack/solid-query";
import { Component, createEffect, createSignal } from "solid-js";

import { deploymentService } from "../../../../services";
import { useKubeStore } from "../../../../stores";
import DialogBar from "../../../shared/terminal/dialog-bar";

interface DescribeDialogProps {
  name: string;
  onClose: () => void;
}

const DescribeDialog: Component<DescribeDialogProps> = (props) => {
  const [deployment, setDeployment] = createSignal<string>("");

  const namespace = useKubeStore((state) => state.namespace);
  const context = useKubeStore((state) => state.context);

  const query = createQuery(() => ({
    queryKey: ["describeDeployment", context(), namespace()],
    queryFn: () =>
      deploymentService.describeDeployment(namespace(), props.name),
  }));

  createEffect(() => {
    if (query.isSuccess) {
      setDeployment(JSON.stringify(query.data, null, 4));
    }
  });

  return (
    <Dialog open fullScreen>
      <DialogBar title="Deployment" onClose={props.onClose} />

      <DialogContent>
        <TextField value={deployment()} multiline fullWidth />
      </DialogContent>
    </Dialog>
  );
};

export default DescribeDialog;
