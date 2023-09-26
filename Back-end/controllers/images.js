const User = require("../models/user");
const HELPERS = require("../util/helpers");

exports.postImage = (req, res, next) => {
  // check authentication
  if (!req.isAuth) {
    const error = new Error("Not authenticated!");
    error.statusCode = 401;
    throw error;
  }

  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }
  if (req.body.oldPath) {
    HELPERS.clearImage(req.body.oldPath);
  }
  return res
    .status(200)
    .json({ message: "File stored.", filePath: req.file.path });
};

exports.userAvatar = async (req, res, next) => {
  try {
    const imagePath = req.file.path.replaceAll("\\", "/");

    // check authentication
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }

    if (!req.file) {
      return res.status(200).json({ message: "No file provided!" });
    }
    // Find user
    const user = await User.findById(req.userId);
    // Delete old photo if exists
    if (user.imageUrl !== "images/blank-profile-picture.png") {
      HELPERS.clearImage(user.imageUrl);
    }
    user.imageUrl = imagePath;
    await user.save();
    return res
      .status(200)
      .json({ message: "File stored.", filePath: req.file.path });
  } catch (err) {
    console.log("my error: ", err);
  }
};
