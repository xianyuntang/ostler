import { Box, Card, Typography } from "@suid/material";
import { blue, grey, orange } from "@suid/material/colors";
import { Component, For, Match, Show, Switch } from "solid-js";

import { podService } from "../../../services";

interface EnvCardProps {
  envs: podService.Pod["spec"]["containers"][0]["env"];
}

const EnvCard: Component<EnvCardProps> = (props) => {
  return (
    <Box>
      <Typography variant="subtitle1">Environment Variable</Typography>
      <Card sx={{ p: "1em", borderColor: orange[600] }} variant="outlined">
        <Typography variant="body2">
          <Show
            when={props.envs}
            keyed
            fallback={<Typography>No environment variables found!</Typography>}
          >
            {(env) => (
              <For each={Object.entries(env)}>
                {([, entry]) => (
                  <div>
                    {entry.name}
                    {" : "}
                    <Switch>
                      <Match when={entry.value}>
                        <Typography component="span" sx={{ color: blue[600] }}>
                          {entry.value}
                        </Typography>
                      </Match>
                      <Match when={entry.valueFrom}>
                        <Typography component="span" sx={{ color: grey[600] }}>
                          {entry.valueFrom?.secretKeyRef.name}
                        </Typography>
                      </Match>
                    </Switch>
                  </div>
                )}
              </For>
            )}
          </Show>
        </Typography>
      </Card>
    </Box>
  );
};

export default EnvCard;
