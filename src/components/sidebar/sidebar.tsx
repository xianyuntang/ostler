import { useNavigate } from "@solidjs/router";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@suid/material";
import { For } from "solid-js";

import ClusterPicker from "./cluster-picker/cluster-picker.tsx";

const SIDEBAR_MENUS = [
  { displayText: "Namespace", path: "/namespace" },
  { displayText: "Deployment", path: "/deployment" },
  { displayText: "Pod", path: "/pod" },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleListItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ width: "15em" }}>
      <List>
        <ListItem>
          <ClusterPicker />
        </ListItem>
        <For each={SIDEBAR_MENUS}>
          {(item) => (
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleListItemClick(item.path)}>
                <ListItemIcon />
                <ListItemText primary={item.displayText} />
              </ListItemButton>
            </ListItem>
          )}
        </For>
      </List>
    </Box>
  );
};

export default Sidebar;
