import DescriptionTwoToneIcon from "@suid/icons-material/DescriptionTwoTone";
import { Box, IconButton } from "@suid/material";
import { Component, createSignal, Show } from "solid-js";

import DescribeDialog from "../describe-dialog";

interface DescribeActionProps {
  name: string;
}

const DescribeAction: Component<DescribeActionProps> = (props) => {
  const [open, setOpen] = createSignal<boolean>(false);

  const handleDescribeClick = async (evt: Event) => {
    setOpen(true);

    evt.stopPropagation();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <IconButton onclick={(evt) => handleDescribeClick(evt)}>
        <DescriptionTwoToneIcon />
      </IconButton>
      <Show when={open()}>
        <DescribeDialog name={props.name} onClose={handleClose} />
      </Show>
    </Box>
  );
};

export default DescribeAction;
