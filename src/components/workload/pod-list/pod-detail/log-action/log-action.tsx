import ArticleTwoToneIcon from "@suid/icons-material/ArticleTwoTone";
import CloseTwoToneIcon from "@suid/icons-material/CloseTwoTone";
import {
  AppBar,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Skeleton,
  Stack,
  Toolbar,
  Typography,
} from "@suid/material";
import { grey } from "@suid/material/colors";
import { createQuery } from "@tanstack/solid-query";
import { Component, createSignal, For, Match, Switch } from "solid-js";

import { podService } from "../../../../../services";
import { useKubeStore } from "../../../../../stores";

interface LogActionProps {
  podName: string;
  containerName: string;
}

const LogAction: Component<LogActionProps> = (props) => {
  const [open, setOpen] = createSignal<boolean>(false);
  const namespace = useKubeStore((state) => state.namespace);

  const query = createQuery(() => ({
    queryKey: ["getContainerLogs", props.podName, props.containerName],
    queryFn: () =>
      podService.getPodLogs(namespace(), props.podName, props.containerName),
    enabled: open(),
    refetchInterval: 500,
  }));

  const handleOpen = async () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton onclick={handleOpen}>
        <ArticleTwoToneIcon />
      </IconButton>
      <Dialog fullScreen open={open()} onClose={handleClose}>
        <AppBar position="static">
          <Toolbar>
            <IconButton onClick={handleClose}>
              <CloseTwoToneIcon sx={{ color: "white" }} />
            </IconButton>
            <Typography
              sx={{
                ml: 2,
                flex: 1,
              }}
              variant="h6"
            >
              Logs
            </Typography>
          </Toolbar>
        </AppBar>

        <DialogContent
          sx={{
            height: "25em",
            backgroundColor: grey[800],
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: "auto",
              overflow: "auto",
            }}
          >
            <Switch>
              <Match when={query.isLoading}>
                <Stack>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </Stack>
              </Match>
              <Match when={query.isSuccess}>
                <For each={query.data}>
                  {(row) => (
                    <Typography
                      noWrap
                      sx={{
                        color: grey[100],
                        display: "inline-block",
                      }}
                    >
                      {row}
                    </Typography>
                  )}
                </For>
              </Match>
            </Switch>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogAction;
