/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import App from "./App";
import DeploymentPage from "./pages/deployment.page";
import PodPage from "./pages/pod.page";

render(
  () => (
    <Router root={App}>
      <Route path="/deployment" component={DeploymentPage} />
      <Route path="/pod" component={PodPage} />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
