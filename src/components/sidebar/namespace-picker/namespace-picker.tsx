import { Box, FormControl, InputLabel, MenuItem, Select } from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select";
import { createQuery } from "@tanstack/solid-query";
import { createEffect, For } from "solid-js";

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

  createEffect(() => {
    if (query.isSuccess) {
      setNamespace(query.data.default);
    }
    console.log(query.data);
  });

  const handleNamespaceChange = async (event: SelectChangeEvent) => {
    setNamespace(event.target.value);
  };

  console.log(query.data);

  return (
    <Box width="100%">
      <FormControl variant="standard" fullWidth>
        <InputLabel id="select-cluster-label">Namespace</InputLabel>
        <Select
          labelId="select-cluster-label"
          label="Cluster"
          value={namespace()}
          onChange={handleNamespaceChange}
        >
          <MenuItem value="">None</MenuItem>
          <For each={query.data?.namespaces}>
            {(row) => <MenuItem value={row}>{row}</MenuItem>}
          </For>
        </Select>
      </FormControl>
    </Box>
  );
};

export default NamespacePicker;
