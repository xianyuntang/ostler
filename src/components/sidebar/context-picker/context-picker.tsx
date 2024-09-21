import { FormControl, InputLabel, MenuItem, Select } from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select";
import { createQuery } from "@tanstack/solid-query";
import { createEffect, For, Match, Switch } from "solid-js";

import { contextService } from "../../../services";
import { useKubeContextStore } from "../../../stores";

const ContextPicker = () => {
  const context = useKubeContextStore((state) => state.context);
  const setContext = useKubeContextStore((state) => state.setContext);

  const query = createQuery(() => ({
    queryKey: ["contexts"],
    queryFn: contextService.listContexts,
  }));

  createEffect(() => {
    if (query.isSuccess) {
      setContext(query.data.current);
    }
  });

  const handleClusterChange = async (event: SelectChangeEvent) => {
    await contextService.switchContext(event.target.value);
    setContext(event.target.value);
  };

  return (
    <FormControl variant="standard" fullWidth>
      <InputLabel id="select-cluster-label">Context</InputLabel>
      <Switch>
        <Match when={query.isSuccess}>
          <Select
            labelId="select-cluster-label"
            label="Cluster"
            value={context()}
            onChange={handleClusterChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <For each={query.data?.contexts}>
              {(row) => <MenuItem value={row}>{row}</MenuItem>}
            </For>
          </Select>
        </Match>
      </Switch>
    </FormControl>
  );
};

export default ContextPicker;
