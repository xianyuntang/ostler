import CloseTwoToneIcon from "@suid/icons-material/CloseTwoTone";
import { AppBar, IconButton, Toolbar, Typography } from "@suid/material";
import { Component } from "solid-js";

interface DialogBarProps {
  title: string;
  onClose: () => void;
}

const DialogBar: Component<DialogBarProps> = (props) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton onClick={props.onClose}>
          <CloseTwoToneIcon sx={{ color: "white" }} color="primary" />
        </IconButton>
        <Typography
          flexGrow={1}
          sx={{
            ml: 2,
          }}
          variant="h6"
        >
          {props.title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default DialogBar;
