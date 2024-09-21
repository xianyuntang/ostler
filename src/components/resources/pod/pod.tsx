import {
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@suid/material";
import { createQuery } from "@tanstack/solid-query";
import dayjs from "dayjs";
import { For, Match, Switch } from "solid-js";

import { podService } from "../../../services";
import { useKubeStore } from "../../../stores";
import ContainerStatus from "./container-status";

const Pod = () => {
  const context = useKubeStore((state) => state.context);
  const namespace = useKubeStore((state) => state.namespace);

  const query = createQuery(() => ({
    queryKey: ["listPods", context(), namespace()],
    queryFn: () => podService.listPods(namespace()),
  }));

  const deployments = () => {
    return query.data?.filter(
      (row) => row.metadata.namespace === namespace() || namespace() === ""
    );
  };

  return (
    <Box>
      <Switch>
        <Match when={query.isLoading}>
          <LinearProgress />
        </Match>
        <Match when={query.isError}>
          <p>Error: {query.error?.message}</p>
        </Match>
        <Match when={query.isSuccess}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "20em" }}>Name</TableCell>
                  <TableCell sx={{ width: "10em" }}>Status</TableCell>
                  <TableCell>Created time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For each={deployments()}>
                  {(row) => (
                    <TableRow
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>{row.metadata.name}</TableCell>
                      <TableCell>
                        <For each={row.status.containerStatuses}>
                          {(containerStatus) => (
                            <ContainerStatus
                              containerStatus={containerStatus}
                            />
                          )}
                        </For>
                      </TableCell>
                      <TableCell>
                        {dayjs(row.metadata.creationTimestamp).toString()}
                      </TableCell>
                    </TableRow>
                  )}
                </For>
              </TableBody>
            </Table>
          </TableContainer>
        </Match>
      </Switch>
    </Box>
  );
};

export default Pod;
