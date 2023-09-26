import React from "react";

import Image from "./Image";
import "./Avatar.css";

const avatar = (props) => (
  <div
    className="avatar"
    style={{ width: props.size + "rem", height: props.size + "rem" }}
  >
    <Image imageUrl={props.imageUrl} />
  </div>
);

export default avatar;
