import { Box, Container } from "@suid/material";
import { ParentComponent } from "solid-js";

import Header from "../header";
import Sidebar from "../sidebar";
import NamespacePicker from "./namespace-picker";

const Layout: ParentComponent = (props) => {
  return (
    <Box sx={{ height: "100vh", width: "100vw" }}>
      <Header />
      <Box
        sx={{
          height: "calc(100% - 3.75em)",
          display: "flex",
        }}
      >
        <Sidebar />
        <Container sx={{ overflow: "scroll", margin: "8px" }}>
          <NamespacePicker />
          {props.children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
