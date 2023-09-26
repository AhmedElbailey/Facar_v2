const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const HELPERS = require("../util/helpers");
const ObjectId = require("mongoose").Types.ObjectId;
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ahmedtemp40@gmail.com",
    pass: "vsgezmtrmwtmuimu",
  },
});
/////////////////////////////////////////////////
module.exports = {
  login: async function ({ email, password }) {
    // check the email
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 401;
      throw error;
    }
    //check the password
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Password is incorrect!");
      error.statusCode = 401;
      throw error;
    }

    // create and send jwt
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      "somesupersecretsecret",
      { expiresIn: "1h" }
    );

    return { token: token, userId: user._id.toString() };
  },

  createUser: async function ({ userInput }, req) {
    // check inputs validation
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "E-mail is invalid." });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "Password must be at least 5 characters." });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }
    //check if user already exists
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error("User already exixts");
      throw error;
    }

    // create new user
    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      name: userInput.name,
      email: userInput.email,
      password: hashedPw,
    });

    const createdUser = await user.save();

    //return the created user
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  createPost: async function ({ postInput }, req) {
    // Check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    // Check inputs validation
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid!" });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid!" });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    // find user
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Invalid user.");
      error.statusCode = 401;
      throw error;
    }
    // create new post

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user,
    });
    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },

  getPosts: async function ({ page }, req) {
    // Check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    // pagination
    if (!page) {
      page = 1;
    }
    const perPage = 2;
    const totalPosts = await Post.find().countDocuments();
    let posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("creator");
    posts = posts.map((post) => {
      return {
        ...post._doc,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      };
    });

    return { posts: posts, totalPosts: totalPosts };
  },

  getUserPosts: async function ({ page }, req) {
    // Check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    // pagination
    if (!page) {
      page = 1;
    }
    const perPage = 2;
    const totalPosts = await Post.find({
      creator: new ObjectId(req.userId),
    }).countDocuments();
    let posts = await Post.find({
      creator: new ObjectId(req.userId),
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("creator");

    if (!posts) {
      return { posts: [], totalPosts: totalPosts };
    }
    posts = posts.map((post) => {
      return {
        ...post._doc,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      };
    });
    return { posts: posts, totalPosts: totalPosts };
  },

  post: async function ({ id }, req) {
    // Check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }

    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.statusCode = 404;
      throw error;
    }
    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },

  publisherData: async function ({ publisherId }, req) {
    try {
      if (!req.isAuth) {
        const error = new Error("Not authenticated!");
        error.statusCode = 401;
        throw error;
      }
      // fetch User from db
      const user = await User.findById(publisherId);
      if (!user) {
        const error = new Error("No user found!");
        error.statusCode = 404;
        throw error;
      }
      return {
        ...user._doc,
        _id: user._id.toString(),
      };
    } catch (err) {
      console.log(err);
    }
  },
  getPublisherPosts: async function ({ publisherId, page }, req) {
    // Check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    // pagination
    if (!page) {
      page = 1;
    }
    const perPage = 2;
    const totalPosts = await Post.find({
      creator: new ObjectId(publisherId),
    }).countDocuments();
    let posts = await Post.find({
      creator: new ObjectId(publisherId),
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("creator");
    if (!posts) {
      return { posts: [], totalPosts: totalPosts };
    }
    posts = posts.map((post) => {
      return {
        ...post._doc,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      };
    });
    return { posts: posts, totalPosts: totalPosts };
  },

  updatePost: async function ({ id, postInput }, req) {
    // Check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    // fetch post from db
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.statusCode = 404;
      throw error;
    }

    //check user authorization to edit the post
    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Not authorizes!");
      error.statusCode = 403;
      throw error;
    }

    // Check inputs validation
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid!" });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid!" });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    // edit the post
    post.title = postInput.title;
    post.content = postInput.content;
    if (postInput.imageUrl !== "undefined") {
      post.imageUrl = postInput.imageUrl;
    }

    const updatedPost = await post.save();
    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },

  deletePost: async function ({ id }, req) {
    // Check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    // fetch post from db
    const post = await Post.findById(id);
    if (!post) {
      const error = new Error("No post found!");
      error.statusCode = 404;
      throw error;
    }

    //check user authorization to edit the post
    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error("Not authorizes!");
      error.statusCode = 403;
      throw error;
    }

    // Delete image from folder
    HELPERS.clearImage(post.imageUrl);

    // Delete post from DB
    await Post.findByIdAndDelete(id);

    // Delete post from user posts in DB
    const user = await User.findById(req.userId);
    user.posts.pull(id);
    await user.save();

    // Return Boolean response
    return true;
  },

  user: async function (arg, req) {
    // Check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    // fetch user from DB
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.statusCode = 404;
      throw error;
    }
    return { ...user._doc, _id: user._id.toString() };
  },

  updateAbout: async function ({ data }, req) {
    // Check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    // fetch and update user from DB
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.statusCode = 404;
      throw error;
    }
    // Updating user data
    if (data.name) user.name = data.name;
    if (data.status) user.status = data.status;
    if (data.purpose) user.purpose = data.purpose;
    if (data.introduction) user.introduction = data.introduction;
    if (data.interests) user.interests = data.interests;
    await user.save();
    return {
      ...user._doc,
      _id: user._id.toString(),
    };
  },
  updateContact: async function ({ data }, req) {
    // Check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    // fetch and update user from DB
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.statusCode = 404;
      throw error;
    }
    // Updating user data
    if (data.phone) user.phone = data.phone;
    if (data.gmail) user.gmail = data.gmail;
    if (data.linkedinLink) user.linkedinLink = data.linkedinLink;
    if (data.githubLink) user.githubLink = data.githubLink;
    await user.save();
    return {
      ...user._doc,
      _id: user._id.toString(),
    };
  },

  sendGamil: async function ({ data }, req) {
    // Check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }
    // fetch and update user from DB
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("No user found!");
      error.statusCode = 404;
      throw error;
    }
    let mailOptions = {
      from: user.email,
      to: data.gmail,
      subject: data.subject,
      text: data.message,
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        throw new Error("Couldn't send an email. Please try again later.");
      } else {
        return true;
      }
    });
  },
};
