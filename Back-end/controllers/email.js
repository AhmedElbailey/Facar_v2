const User = require("../models/user");
const HELPERS = require("../util/helpers");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ahmedtemp40@gmail.com",
    pass: "vsgezmtrmwtmuimu",
  },
});

exports.sendEmail = async (req, res, next) => {
  try {
    // check authentication
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
    // Send email
    req.body.message = req.body.message.replace(/\n/g, "<br>");
    let html = `
      <h2>From: ${user.email}</h2>
      <p>${req.body.message}<p>
        `;
    let mailOptions = {
      from: user.email,
      to: req.body.sentToEmail,
      subject: req.body.subject,
      html: html,
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        throw new Error("Couldn't send an email. Please try again later.");
      } else {
        return true;
      }
    });
  } catch (err) {
    console.log(err);
  }
};
