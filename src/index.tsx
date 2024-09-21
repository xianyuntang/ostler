/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import App from "./App";
import Deployment from "./pages/deployment";
import Pod from "./pages/pod";

render(
  () => (
    <Router root={App}>
      <Route path="/deployment" component={Deployment} />
      <Route path="/pod" component={Pod} />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
