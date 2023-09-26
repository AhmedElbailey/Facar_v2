import React from "react";

import Button from "../../Button/Button";
import Avatar from "../../Image/Avatar";
import "./Post.css";
import { NavLink } from "react-router-dom";

const post = (props) => (
  <article className="post">
    <header className="post__header">
      <div className="post__header-head">
        <div className="avatar-image">
          {/* <Image imageUrl={props.userAvatar} contain /> */}
          <Avatar size="3" imageUrl={props.userAvatar}></Avatar>
        </div>
        <h3 className="post__meta">
          <NavLink
            className="publisherLink"
            to={"/publisherPage/" + props.publisherId}
            exact
            onClick={props.onChoose}
          >
            {props.author}
          </NavLink>
          on {props.date}
        </h3>
      </div>
      <h1 className="post__title">{props.title}</h1>
    </header>
    <div className="post__content">{props.content}</div>
    <div className="post__actions">
      <Button mode="flat" link={"/" + props.id}>
        View
      </Button>

      {props.edit && (
        <Button mode="flat" onClick={props.onStartEdit}>
          Edit
        </Button>
      )}
      {props.delete && (
        <Button mode="flat" design="danger" onClick={props.onDelete}>
          Delete
        </Button>
      )}
    </div>
  </article>
);

export default post;
