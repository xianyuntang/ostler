import { AppBar, Stack, Toolbar, Typography } from "@suid/material";

import ContextPicker from "./context-picker";

const Header = () => {
  return (
    <AppBar position="static" sx={{ height: "4rem" }}>
      <Toolbar>
        <Stack direction="row" spacing={4}>
          <Typography variant="h6">Ostler</Typography>
          <ContextPicker />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
