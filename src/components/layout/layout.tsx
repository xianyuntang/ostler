import { Box, Container, Paper, useTheme } from "@suid/material";
import { ParentComponent } from "solid-js";

import Header from "../header";
import Sidebar from "../sidebar";

const Layout: ParentComponent = (props) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Header />
      <Paper
        sx={{
          height: "calc(100% - 4rem)",
          display: "flex",
        }}
      >
        <Sidebar />
        <Container
          sx={{
            width: "100%",
            height: "100%",
            overflow: "scroll",
            padding: "0.5rem",
          }}
        >
          {props.children}
        </Container>
      </Paper>
    </Box>
  );
};

export default Layout;
