import { createTheme } from "@suid/material";
import { CssBaseline, ThemeProvider } from "@suid/material";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { ParentComponent } from "solid-js";

import Layout from "./components/layout";

const theme = createTheme({
  palette: { mode: "dark" },
});
const queryClient = new QueryClient();

const App: ParentComponent = (props) => {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Layout>{props.children}</Layout>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
};

export default App;
