import { FormControl, InputLabel, MenuItem, Select } from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select";
import { createQuery } from "@tanstack/solid-query";
import { createEffect, createSignal, For, Show } from "solid-js";

import { namespaceService } from "../../../services";
import { useKubeStore } from "../../../stores";

const NamespacePicker = () => {
  const context = useKubeStore((state) => state.context);
  const namespace = useKubeStore((state) => state.namespace);
  const setNamespace = useKubeStore((state) => state.setNamespace);
  const [shouldRender, setShouldRender] = createSignal<boolean>(false);

  const query = createQuery(() => ({
    queryKey: ["listNamespaces", context()],
    queryFn: namespaceService.listNamespaces,
  }));

  createEffect(() => {
    if (query.isFetching) {
      setShouldRender(false);
    } else if (query.isSuccess) {
      setShouldRender(true);
    }
  });

  const handleNamespaceChange = async (event: SelectChangeEvent) => {
    setNamespace(event.target.value);
  };

  return (
    <Show
      when={shouldRender()}
      fallback={
        <FormControl variant="standard" fullWidth>
          <InputLabel id="select-cluster-label">Namespace</InputLabel>
          <Select
            labelId="select-cluster-label"
            label="Cluster"
            value={namespace()}
            onChange={handleNamespaceChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
          </Select>
        </FormControl>
      }
    >
      <FormControl variant="standard" fullWidth>
        <InputLabel id="select-cluster-label">Namespace</InputLabel>
        <Select
          labelId="select-cluster-label"
          label="Cluster"
          value={namespace()}
          onChange={handleNamespaceChange}
        >
          <For each={query.data}>
            {(row) => <MenuItem value={row}>{row}</MenuItem>}
          </For>
        </Select>
      </FormControl>
    </Show>
  );
};

export default NamespacePicker;
