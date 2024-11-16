import DeleteOutlineTwoToneIcon from "@suid/icons-material/DeleteOutlineTwoTone";
import {
  Alert,
  Box,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
} from "@suid/material";
import { ChangeEvent } from "@suid/types";
import { createQuery } from "@tanstack/solid-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { createSignal, For, Match, Show, Switch } from "solid-js";

import { podService } from "../../../services";
import { useKubeStore } from "../../../stores";
import ContainerStatus from "./container-status";
import PodDetail from "./pod-detail";
dayjs.extend(relativeTime);

const PodList = () => {
  const [podDetailOpen, setPodDetailOpen] = createSignal<boolean>(false);
  const [selectedPod, setSelectedPod] = createSignal<podService.Pod | null>(
    null
  );
  const [filter, setFilter] = createSignal<string>("");

  const context = useKubeStore((state) => state.context);
  const namespace = useKubeStore((state) => state.namespace);

  const query = createQuery(() => ({
    queryKey: ["listPods", context(), namespace()],
    queryFn: () => podService.listPods(namespace()),
    refetchInterval: 3000,
  }));

  const pods = () => {
    return query.data?.filter(
      (pod) => pod.metadata.namespace === namespace() || namespace() === ""
    );
  };

  const handleRowClick = (pod: podService.Pod) => {
    setPodDetailOpen(true);
    setSelectedPod(pod);
  };

  const handlePodDetailClose = () => {
    setPodDetailOpen(false);
  };

  const handleDeletePodClick = async (evt: Event, name: string) => {
    evt.stopPropagation();
    await podService.deletePod(namespace(), name);
    await query.refetch();
  };

  const handleFilterChange = (
    _: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string
  ) => {
    setFilter(value);
  };

  return (
    <Box>
      <Switch>
        <Match when={query.isLoading}>
          <LinearProgress />
        </Match>
        <Match when={query.isError}>
          <Alert severity="error">{query.error?.message}</Alert>
        </Match>
        <Match when={query.isSuccess}>
          <Toolbar>
            <TextField
              size="small"
              label="Filter"
              autoComplete="off"
              value={filter()}
              onChange={handleFilterChange}
              variant="standard"
            />
          </Toolbar>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "20em" }}>Name</TableCell>
                  <TableCell sx={{ width: "10em" }}>Status</TableCell>
                  <TableCell sx={{ width: "10em" }}>Age</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For
                  each={pods()?.filter((pod) =>
                    pod.metadata.name.includes(filter())
                  )}
                >
                  {(pod) => (
                    <TableRow onclick={() => handleRowClick(pod)}>
                      <TableCell>{pod.metadata.name}</TableCell>
                      <TableCell>
                        <For each={pod.status.containerStatuses}>
                          {(containerStatus) => (
                            <ContainerStatus
                              containerStatus={containerStatus}
                            />
                          )}
                        </For>
                      </TableCell>
                      <TableCell>
                        {dayjs(pod.metadata.creationTimestamp).fromNow()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onclick={(evt) =>
                            handleDeletePodClick(evt, pod.metadata.name)
                          }
                        >
                          <DeleteOutlineTwoToneIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )}
                </For>
              </TableBody>
            </Table>
          </TableContainer>
          <Show when={selectedPod()} keyed>
            {(pod) => (
              <PodDetail
                open={podDetailOpen()}
                pod={pod}
                onClose={handlePodDetailClose}
              />
            )}
          </Show>
        </Match>
      </Switch>
    </Box>
  );
};

export default PodList;
