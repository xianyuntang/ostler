import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Drawer,
  Typography,
} from "@suid/material";
import { blue, grey } from "@suid/material/colors";
import { Component, For, Match, Switch } from "solid-js";

import { podService } from "../../../../services";
import LogAction from "./log-action";
import PortforwardAction from "./portforward-action";

interface PodDetailProps {
  open: boolean;
  pod: podService.Pod;
  onClose: () => void;
}

const PodDetail: Component<PodDetailProps> = (props) => {
  console.log(props.pod);
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
          {(container) => (
            <Card sx={{ margin: "1.25em" }}>
              <CardHeader
                action={
                  props.pod && (
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
                  )
                }
              />
              <CardContent>
                <Typography variant="h6">{container.name}</Typography>
                <Typography variant="subtitle1">Image</Typography>
                <Typography variant="body2">{container.image}</Typography>
                <Typography variant="subtitle1">Env</Typography>
                <Typography variant="body2">
                  <For each={Object.entries(container.env)}>
                    {([, entry]) => (
                      <div>
                        {entry.name}
                        {" : "}
                        <Switch>
                          <Match when={entry.value}>
                            <Typography
                              component="span"
                              sx={{ color: blue[600] }}
                            >
                              {entry.value}
                            </Typography>
                          </Match>
                          <Match when={entry.valueFrom}>
                            <Typography
                              component="span"
                              sx={{ color: grey[600] }}
                            >
                              {entry.valueFrom?.secretKeyRef.name}
                            </Typography>
                          </Match>
                        </Switch>
                      </div>
                    )}
                  </For>
                </Typography>
              </CardContent>
            </Card>
          )}
        </For>
      </Container>
    </Drawer>
  );
};

export default PodDetail;
