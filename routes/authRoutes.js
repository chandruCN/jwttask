const express = require("express");
const authRoutes = express.Router();
const app = express();
const User = require("../models/User");
const router = express.Router();
const { hashGenerate } = require("../helpers/hashing");
const { hashValidator } = require("../helpers/hashing");
const { tokenGenerator } = require("../helpers/token");
const authVerify = require("../helpers/authVerify");

authRoutes.post("/signup", async (req, res) => {
  try {
    const hashPassword = await hashGenerate(req.body.password);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashPassword,
    });
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (err) {
    res.send(err);
  }
});

authRoutes.post("/signin", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      res.send("email is invalid");
    } else {
      const checkUser = await hashValidator(
        req.body.password,
        existingUser.password
      );
      if (!checkUser) {
        res.send("password is invalid");
      } else {
        const token = await tokenGenerator(existingUser.email); //generating a token

        res.cookie("jwt", token);

        res.send(token);
      }
    }
  } catch (error) {
    res.send(error);
  }
});

module.exports = authRoutes;
