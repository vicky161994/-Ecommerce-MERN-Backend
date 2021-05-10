const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const userRouter = express.Router();
const User = require("../models/userModel");
const generateToken = require("../config/utlis");

userRouter.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(401).send({
        message: "Fields are missing",
        status: 401,
      });
    }
    const isUserExist = await User.findOne({ email: req.body.email });
    if (isUserExist) {
      return res.status(200).send({
        message: "This email already registered",
        status: 204,
      });
    }
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
    });
    const registeredUser = await user.save();
    res.send({
      message: "User Registered Successfully",
      status: "201",
    });
  })
);

userRouter.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.status(401).send({
        status: 401,
        message: "Fields are required",
      });
    }
    const isUserExist = await User.findOne({ email: req.body.email });
    if (!isUserExist) {
      return res.status(401).send({
        status: 401,
        message: "Email not found!",
      });
    }
    if (bcrypt.compareSync(req.body.password, isUserExist.password)) {
      return res.status(200).send({
        _id: isUserExist._id,
        _id: isUserExist._id,
        name: isUserExist.name,
        email: isUserExist.email,
        isAdmin: isUserExist.isAdmin,
        token: generateToken(isUserExist),
      });
    } else {
      return res.status(401).send({
        message: "Invalid Credentials",
      });
    }
  })
);

module.exports = userRouter;
