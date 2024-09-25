import {
  Card,
  CardActions,
  CardContent,
  Container,
  Drawer,
  Typography,
} from "@suid/material";
import { Component, For } from "solid-js";

import { podService } from "../../../../services";
import EnvCard from "../../env-card";
import LogAction from "./log-action";
import PortforwardAction from "./portforward-action";

interface PodDetailProps {
  open: boolean;
  pod: podService.Pod;
  onClose: () => void;
}

const PodDetail: Component<PodDetailProps> = (props) => {
  const getStatus = (index: number) => {
    return props.pod.status.containerStatuses[index];
  };
  return (
    <Drawer anchor="right" open={props.open} onClose={props.onClose}>
      <Container
        sx={{
          width: "70vw",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6">{props.pod?.metadata.name}</Typography>
        <For each={props.pod?.spec.containers}>
          {(container, index) => (
            <Card sx={{ m: "1em" }}>
              <CardContent>
                <Typography variant="h6">{container.name}</Typography>
                <Typography variant="subtitle1">
                  {"Image : "}
                  <Typography variant="body2" component="span">
                    {container.image}
                  </Typography>
                </Typography>
                <EnvCard envs={container.env} />

                <Typography variant="subtitle1">
                  {"Restart : "}
                  <Typography variant="body2" component="span">
                    {getStatus(index()).restartCount}
                  </Typography>
                </Typography>
              </CardContent>
              <CardActions>
                {props.pod && (
                  <>
                    <PortforwardAction
                      podName={props.pod.metadata.name}
                      containerName={container.name}
                      ports={container.ports}
                    />
                    <LogAction
                      podName={props.pod.metadata.name}
                      containerName={container.name}
                    />
                  </>
                )}
              </CardActions>
            </Card>
          )}
        </For>
      </Container>
    </Drawer>
  );
};

export default PodDetail;
