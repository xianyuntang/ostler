import { AppBar, Toolbar, Typography } from "@suid/material";

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Ostler</Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
