import { useNavigate } from "@solidjs/router";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@suid/material";
import { For } from "solid-js";

import NamespacePicker from "./namespace-picker";

const SIDEBAR_MENUS = [
  {
    name: "Workload",
    resources: [
      { displayText: "Deployment", path: "/workload/deployment" },
      { displayText: "Pod", path: "/workload/pod" },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleListItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <Stack sx={{ width: "20em", maxWidth: "20em" }}>
      <List>
        <ListItem>
          <NamespacePicker />
        </ListItem>
        <For each={SIDEBAR_MENUS}>
          {(item) => (
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon />
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
              <For each={item.resources}>
                {(resource) => (
                  <ListItem>
                    <ListItemButton
                      onclick={() => handleListItemClick(resource.path)}
                    >
                      <ListItemIcon />
                      <ListItemText primary={resource.displayText} />
                    </ListItemButton>
                  </ListItem>
                )}
              </For>
            </List>
          )}
        </For>
      </List>
    </Stack>
  );
};

export default Sidebar;
