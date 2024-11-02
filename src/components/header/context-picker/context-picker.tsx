import DeleteForeverTwoToneIcon from "@suid/icons-material/DeleteForeverTwoTone";
import FileUploadTwoToneIcon from "@suid/icons-material/FileUploadTwoTone";
import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
} from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select";
import { createQuery } from "@tanstack/solid-query";
import { open } from "@tauri-apps/plugin-dialog";
import { For } from "solid-js";

import { contextService } from "../../../services";
import { useKubeStore } from "../../../stores";

const ContextPicker = () => {
  const context = useKubeStore((state) => state.context);
  const setContext = useKubeStore((state) => state.setContext);

  const query = createQuery(() => ({
    queryKey: ["contexts"],
    queryFn: contextService.listContexts,
  }));

  const handleContextChange = async (event: SelectChangeEvent) => {
    await contextService.switchContext(event.target.value);
    setContext(event.target.value);
  };

  const handleAddNewContext = async () => {
    const file = await open({
      multiple: false,
      directory: false,
    });
    if (file) {
      await contextService.addContext(file);
      await query.refetch();
    }
  };

  const handleRemoveContext = async () => {
    await contextService.removeContext(context());
    await query.refetch();
  };

  return (
    <Stack direction="row">
      <Box width="240px">
        <FormControl variant="standard" fullWidth>
          <Select
            labelId="select-cluster-label"
            value={context()}
            onChange={handleContextChange}
          >
            <For each={query.data?.contexts ?? []}>
              {(row) => <MenuItem value={row}>{row}</MenuItem>}
            </For>
          </Select>
        </FormControl>
      </Box>

      <IconButton onclick={handleAddNewContext}>
        <FileUploadTwoToneIcon />
      </IconButton>
      <IconButton onclick={handleRemoveContext}>
        <DeleteForeverTwoToneIcon />
      </IconButton>
    </Stack>
  );
};

export default ContextPicker;
