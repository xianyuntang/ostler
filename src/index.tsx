/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import App from "./App";
import DeploymentPage from "./pages/deployment.page";
import PodPage from "./pages/pod.page";

render(
  () => (
    <Router root={App}>
      <Route path="/workload/deployment" component={DeploymentPage} />
      <Route path="/workload/pod" component={PodPage} />
    </Router>
  ),
  document.getElementById("root") as HTMLElement,
);
