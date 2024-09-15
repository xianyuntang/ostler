import { FormControl, InputLabel, MenuItem, Select } from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select";
import { createSignal } from "solid-js";

const ClusterPicker = () => {
  const [cluster, setCluster] = createSignal<string>("");

  const handleClusterChange = (event: SelectChangeEvent) => {
    setCluster(event.target.value);
  };

  return (
    <FormControl variant="standard" fullWidth>
      <InputLabel id="select-cluster-label">Cluster</InputLabel>
      <Select
        labelId="select-cluster-label"
        label="Cluster"
        value={cluster()}
        onChange={handleClusterChange}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={10}>k3s</MenuItem>
        <MenuItem value={20}>lab5</MenuItem>
        <MenuItem value={30}>lab6</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ClusterPicker;
