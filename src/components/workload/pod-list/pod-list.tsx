import {
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@suid/material";
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
  const context = useKubeStore((state) => state.context);
  const namespace = useKubeStore((state) => state.namespace);

  const query = createQuery(() => ({
    queryKey: ["listPods", context(), namespace()],
    queryFn: () => podService.listPods(namespace()),
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

  return (
    <Box>
      <Switch>
        <Match when={query.isLoading}>
          <LinearProgress />
        </Match>
        <Match when={query.isError}>
          <Typography>Error: {query.error?.message}</Typography>
        </Match>
        <Match when={query.isSuccess}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "20em" }}>Name</TableCell>
                  <TableCell sx={{ width: "10em" }}>Status</TableCell>
                  <TableCell>Age</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For each={pods()}>
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
