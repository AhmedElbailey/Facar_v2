const express = require("express");
const app = express();
const mongoose = require("mongoose");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

// Receiving Data//////////////////
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(8, (err, buffer) => {
      if (err) {
        next(err);
      }
      cb(null, buffer.toString("hex") + "-" + file.originalname);
    });
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

// Initial Middlewares //////////////////////////
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// GraphQL //////////////////////////////////
const { graphqlHTTP } = require("express-graphql");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const isAuth = require("./routes-protection/is-auth");
const imageController = require("./controllers/images");
const emailController = require("./controllers/email");

app.use(isAuth);

app.put("/post-image", imageController.postImage);
app.put("/user-avatar", imageController.userAvatar);
app.post("/sendGmail", emailController.sendEmail);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const statusCode = err.originalError.statusCode;
      const message = err.message || "An error occured!";
      return {
        message: message,
        statusCode: statusCode,
        data: data,
      };
    },
  })
);

///////////////////////////////////
mongoose
  .connect(
    "mongodb+srv://Ahmed_Adel:Ahmed_123456789@cluster0.trguitc.mongodb.net/messages?retryWrites=true&w=majority"
  )
  .then((res) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
