import { Box, Container, createTheme } from "@suid/material";
import { CssBaseline, ThemeProvider } from "@suid/material";
import { ParentComponent } from "solid-js";

import Header from "./components/header";
import Sidebar from "./components/sidebar";

const theme = createTheme({});

const App: ParentComponent = (props) => {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Box sx={{ height: "100vh", width: "100vw" }}>
          <Header />
          <Box sx={{ display: "flex" }}>
            <Sidebar />
            <Container>{props.children}</Container>
          </Box>
        </Box>
      </ThemeProvider>
    </>
  );
};

export default App;
