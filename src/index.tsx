/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import App from "./App";

render(
  () => (
    <Router root={App}>
      <Route path="/" />
    </Router>
  ),
  document.getElementById("root") as HTMLElement,
);
