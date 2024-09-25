import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@suid/material";
import { LinearProgress } from "@suid/material";
import { green, orange, red } from "@suid/material/colors";
import { createQuery } from "@tanstack/solid-query";
import dayjs from "dayjs";
import { For, Match, Switch } from "solid-js";

import { deploymentService } from "../../../services";
import { useKubeStore } from "../../../stores";

const Deployment = () => {
  const context = useKubeStore((state) => state.context);
  const namespace = useKubeStore((state) => state.namespace);

  const query = createQuery(() => ({
    queryKey: ["listDeployments", context(), namespace()],
    queryFn: () => deploymentService.listDeployments(namespace()),
  }));

  const getReadyColor = (ready: number, desired: number) => {
    if (ready === 0 && desired === 0) {
      return orange[500];
    } else if (ready < desired) {
      return red[500];
    } else {
      return green[500];
    }
  };

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
                      <TableCell
                        sx={{
                          color: getReadyColor(
                            row.status.readyReplicas || 0,
                            row.status.replicas || 0
                          ),
                        }}
                      >
                        {row.status.readyReplicas || 0}/
                        {row.status.replicas || 0}
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

export default Deployment;
