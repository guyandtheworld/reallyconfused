import React from "react";
import styles from "./ToolTip.module.scss";
import { OverlayTrigger } from "react-bootstrap";

const ToolTip = (props) => {
  return (
    <div>
      <OverlayTrigger
        className={"position-relative"}
        overlay={<div className={styles.tooltip}>{props?.text}</div>}
      >
        <div>{props?.children}</div>
      </OverlayTrigger>
    </div>
  );
};
export default ToolTip;
