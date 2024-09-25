import { FormControl, InputLabel, MenuItem, Select } from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select";
import { createQuery } from "@tanstack/solid-query";
import { createEffect, createSignal, For, Show } from "solid-js";

import { contextService } from "../../../services";
import { useKubeStore } from "../../../stores";

const ContextPicker = () => {
  const context = useKubeStore((state) => state.context);
  const setContext = useKubeStore((state) => state.setContext);
  const setNamespace = useKubeStore((state) => state.setNamespace);
  const [shouldRender, setShouldRender] = createSignal<boolean>(false);

  const query = createQuery(() => ({
    queryKey: ["contexts"],
    queryFn: contextService.listContexts,
  }));

  createEffect(() => {
    if (query.isFetching) {
      setShouldRender(false);
    } else if (query.isSuccess) {
      setShouldRender(true);
      setContext(query.data?.current.name || "");
      setNamespace(query.data?.current.context.namespace || "");
    }
  });

  const handleClusterChange = async (event: SelectChangeEvent) => {
    const response = await contextService.switchContext(event.target.value);
    setContext(response.namedContext.name);
    setNamespace(response.namedContext.context.namespace);
  };

  return (
    <Show
      when={shouldRender()}
      fallback={
        <FormControl variant="standard" fullWidth>
          <InputLabel id="select-cluster-label">Context</InputLabel>
          <Select
            labelId="select-cluster-label"
            label="Cluster"
            value={context()}
            onChange={handleClusterChange}
          >
            <MenuItem value="" />
          </Select>
        </FormControl>
      }
    >
      <FormControl variant="standard" fullWidth>
        <InputLabel id="select-cluster-label">Context</InputLabel>
        <Select
          labelId="select-cluster-label"
          label="Cluster"
          value={context()}
          onChange={handleClusterChange}
        >
          <For each={query.data?.contexts ?? []}>
            {(row) => <MenuItem value={row.name}>{row.name}</MenuItem>}
          </For>
        </Select>
      </FormControl>
    </Show>
  );
};

export default ContextPicker;
