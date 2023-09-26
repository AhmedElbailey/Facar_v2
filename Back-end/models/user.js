const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "I am new!",
    },
    introduction: {
      type: String,
      default: "",
    },
    purpose: {
      type: String,
      default: "",
    },
    interests: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "images/blank-profile-picture.png",
    },
    phone: {
      type: String,
      default: "",
    },
    gmail: {
      type: String,
      default: "",
      validator: {},
    },
    linkedinLink: {
      type: String,
      default: "",
    },
    githubLink: {
      type: String,
      default: "",
    },

    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { versionKey: false }
);

module.exports = mongoose.model("User", userSchema);
