import { AppBar, Box, Typography } from "@suid/material";

function App() {
  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <AppBar position="static">
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          News
        </Typography>
      </AppBar>
    </Box>
  );
}

export default App;
