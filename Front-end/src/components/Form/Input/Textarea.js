import React, { useState } from "react";

import "./Input.css";

const Textarea = (props) => (
  <div className="input">
    {props.label && <label htmlFor={props.id}>{props.label}</label>}
    {props.control === "input" && (
      <textarea
        className={[
          !props.valid ? "invalid" : "valid",
          props.touched ? "touched" : "untouched",
        ].join(" ")}
        type={props.type}
        id={props.id}
        required={props.required}
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) =>
          props.onChange(props.id, e.target.value, e.target.files)
        }
        onBlur={props.onBlur}
        disabled={props.disabled || false}
      />
    )}
    {props.control === "textarea" && (
      <textarea
        className={[
          !props.valid ? "invalid" : "valid",
          props.touched ? "touched" : "untouched",
        ].join(" ")}
        id={props.id}
        rows={props.rows}
        required={props.required}
        value={props.value}
        onChange={(e) => props.onChange(props.id, e.target.value)}
        onBlur={props.onBlur}
      />
    )}
  </div>
);

export default Textarea;
