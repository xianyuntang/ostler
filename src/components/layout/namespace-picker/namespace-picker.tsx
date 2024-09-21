import { FormControl, InputLabel, MenuItem, Select } from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select";
import { createQuery } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";

import { namespaceService } from "../../../services";
import { useKubeStore } from "../../../stores";

const NamespacePicker = () => {
  const context = useKubeStore((state) => state.context);
  const namespace = useKubeStore((state) => state.namespace);
  const setNamespace = useKubeStore((state) => state.setNamespace);

  const query = createQuery(() => ({
    queryKey: ["listNamespaces", context()],
    queryFn: namespaceService.listNamespaces,
  }));

  const handleNamespaceChange = async (event: SelectChangeEvent) => {
    setNamespace(event.target.value);
  };

  return (
    <Switch>
      <Match when={query.isLoading}>
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
      </Match>
      <Match when={query.isSuccess}>
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
            <For each={query.data}>
              {(row) => <MenuItem value={row}>{row}</MenuItem>}
            </For>
          </Select>
        </FormControl>
      </Match>
    </Switch>
  );
};

export default NamespacePicker;
