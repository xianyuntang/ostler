import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@suid/material";
import { green, orange, red } from "@suid/material/colors";
import { createQuery } from "@tanstack/solid-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Match, Switch } from "solid-js";

import { deploymentService } from "../../../services";
import { useKubeStore } from "../../../stores";
import DescribeAction from "./describe-action";
dayjs.extend(relativeTime);

const DeploymentList = () => {
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
    <Switch>
      <Match when={query.isLoading}>
        <Box>
          <CircularProgress />
        </Box>
      </Match>
      <Match when={query.isError}>
        <Box>
          <Typography>Error: {query.error?.message}</Typography>
        </Box>
      </Match>
      <Match when={query.isSuccess}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "20em" }}>Name</TableCell>
                <TableCell sx={{ width: "10em" }}>Status</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <For each={deployments()}>
                {(deployment) => (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>{deployment.metadata.name}</TableCell>
                    <TableCell
                      sx={{
                        color: getReadyColor(
                          deployment.status.readyReplicas || 0,
                          deployment.status.replicas || 0
                        ),
                      }}
                    >
                      {deployment.status.readyReplicas || 0}/
                      {deployment.status.replicas || 0}
                    </TableCell>
                    <TableCell>
                      {dayjs(deployment.metadata.creationTimestamp).fromNow()}
                    </TableCell>
                    <TableCell>
                      <DescribeAction name={deployment.metadata.name} />
                    </TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </For>
            </TableBody>
          </Table>
        </TableContainer>
      </Match>
    </Switch>
  );
};

export default DeploymentList;
