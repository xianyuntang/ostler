import {
  Box,
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

import { namespaceService } from "../../services";

const Namespace = () => {
  const query = createQuery(() => ({
    queryKey: ["namespaces"],
    queryFn: namespaceService.listNamespace,
  }));

  return (
    <Box>
      <Switch>
        <Match when={query.isLoading}>
          <p>Loading...</p>
        </Match>
        <Match when={query.isError}>
          <p>Error: {query.error?.message}</p>
        </Match>
        <Match when={query.isSuccess}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For each={query.data}>
                  {(row) => (
                    <TableRow
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>{row.metadata.name}</TableCell>
                      <TableCell>{row.status.phase}</TableCell>
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

export default Namespace;
