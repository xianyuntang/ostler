import { FormControl, InputLabel, MenuItem, Select } from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select";
import { createQuery } from "@tanstack/solid-query";
import { createEffect, For, Show } from "solid-js";

import { contextService } from "../../../services";
import { useKubeStore } from "../../../stores";

const ContextPicker = () => {
  const context = useKubeStore((state) => state.context);
  const setContext = useKubeStore((state) => state.setContext);
  const setNamespace = useKubeStore((state) => state.setNamespace);

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
    setNamespace("");
  };

  return (
    <Show when={query.data}>
      <FormControl variant="standard" fullWidth>
        <InputLabel id="select-cluster-label">Context</InputLabel>
        <Select
          labelId="select-cluster-label"
          label="Cluster"
          value={context()}
          onChange={handleClusterChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <Show when={query.isSuccess}>
            <For each={query.data?.contexts}>
              {(row) => <MenuItem value={row}>{row}</MenuItem>}
            </For>
          </Show>
        </Select>
      </FormControl>
    </Show>
  );
};

export default ContextPicker;
