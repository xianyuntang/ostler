import CircleTwoToneIcon from "@suid/icons-material/CircleTwoTone";
import { Popover, Typography } from "@suid/material";
import { green, red } from "@suid/material/colors";
import { Component, createSignal, Show } from "solid-js";

import { Pod } from "../../../../services/pod";

interface ContainerStatusProps {
  containerStatus: Pod["status"]["containerStatuses"][0];
}

const ContainerStatus: Component<ContainerStatusProps> = (props) => {
  const [anchorEl, setAnchorEl] = createSignal<Element | null>(null);

  const handlePopoverOpen = (event: { currentTarget: Element }) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = () => Boolean(anchorEl());
  return (
    <>
      <Show
        when={props.containerStatus.ready}
        fallback={
          <CircleTwoToneIcon
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            sx={{ color: red[500] }}
          />
        }
      >
        <CircleTwoToneIcon
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
          sx={{ color: green[500] }}
        />
      </Show>

      <Popover
        sx={{ pointerEvents: "none" }}
        open={open()}
        anchorEl={anchorEl()}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        disableRestoreFocus
      >
        <Typography sx={{ p: 2 }}>{props.containerStatus.name}</Typography>
      </Popover>
    </>
  );
};

export default ContainerStatus;
