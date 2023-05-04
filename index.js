const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const router = express.Router();

const { hashGenerate } = require("../jwttask/helpers/hashing");
const { hashValidator } = require("../jwttask/helpers/hashing");
const { tokenGenerator } = require("../jwttask/helpers/token");
var URL = require("url").URL;

var userschem = require("./models/User");
fs = require("fs");

const cookiesParser = require("cookie-parser");
var bodyParser = require("body-parser"); //handle http post request
var path = require("path");
var helmet = require("helmet"); //security thrests
let alert = require("alert");
const { log, debug } = require("console");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./index.html")));
app.use(express.static(path.join(__dirname, "./dashboard.html")));
app.use(helmet());

dotenv.config();

// const port = 3000;
const DB_URL = "mongodb://0.0.0.0:27017/Project 0";
mongoose.connect(
  process.env.DB_URL,
  { useNewUrlParser: true },
  mongoose.set("strictQuery", false),

  () => {}
);

// module.exports = connectDB
app.use(cookiesParser());

app.use(express.json());

//routes
app.use("/api/user/", authRoutes);

app.post("/authenticate", async (req, res) => {
  try {
    const existingUser = await userschem.findOne({ email: req.body.username }); //await like promises
    if (!existingUser) {
      alert("email is invalid");
    } else {
      const checkUser = await hashValidator(
        req.body.password,
        existingUser.password
      );

      if (!checkUser) {
        alert("password in incorrect");
      } else {
        const token = await tokenGenerator(existingUser.email); //generating a token
        res.cookie("jwt", token);
        res.redirect("/dashboard");
      }
    }
  } catch (error) {
    res.send(error);
  }
});
app.get("/", function (req, res) {
  const token = req.cookies;
  if (!token.jwt) {
    res.sendFile(path.join(__dirname, "./index.html"));
  } else {
    res.sendFile(path.join(__dirname, "./dashboard.html"));
  }
});

app.get("/dashboard", function (req, res) {
  const token = req.cookies;
  if (!token.jwt) {
    res.sendFile(path.join(__dirname, "./index.html"));
    return res.redirect("/");
  } else {
    res.sendFile(path.join(__dirname, "./dashboard.html"));
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  return res.redirect("/");
});

app.listen(3000, () => {
  console.log("port running in 3000");
});
