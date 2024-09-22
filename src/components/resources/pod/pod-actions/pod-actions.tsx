import { Component } from "solid-js";

import { Pod } from "../../../../services/pod.ts";
import PortforwardAction from "./portforward-action";

interface PodActionsProps {
  pod: Pod;
}

const PodActions: Component<PodActionsProps> = (props) => {
  return (
    <>
      <PortforwardAction
        name={props.pod.metadata.name}
        ports={props.pod.spec.containers[0].ports}
      />
    </>
  );
};

export default PodActions;
