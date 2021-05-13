const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const userRouter = express.Router();
const User = require("../models/userModel");
const generateToken = require("../config/utlis");
const isAuth = require("../middlewares/authMiddleware");
const mongoose = require("mongoose");

userRouter.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    if (
      !req.body.name ||
      !req.body.email ||
      !req.body.password ||
      !req.body.number
    ) {
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
      number: req.body.number,
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
        name: isUserExist.name,
        email: isUserExist.email,
        number: isUserExist.number,
        wishlist: isUserExist.wishlist,
        cartItems: isUserExist.cartItems,
        token: generateToken(isUserExist),
      });
    } else {
      return res.status(401).send({
        message: "Invalid Credentials",
      });
    }
  })
);

userRouter.post(
  "/add-wishlist",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (!req.body.productId) {
      return res.status(401).send({
        message: "productId is missing",
      });
    }
    const user = await User.findById(req.user._id);
    if (user.wishlist.includes(req.body.productId)) {
      const updateResponse = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $pull: { wishlist: req.body.productId } }
      );
    } else {
      const updateResponse = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { wishlist: req.body.productId } }
      );
    }
    return res.status(200).send({ status: 201, message: "wishlist manage" });
  })
);

userRouter.post(
  "/add-to-cart",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (!req.body) {
      return res
        .status(401)
        .send({ status: 401, message: "Cart items missing" });
    }
    let finalData = [];
    req.body.cartItems.forEach(async (element) => {
      let _id = mongoose.Types.ObjectId(element.productId);
      let data = { productId: _id, qty: element.qty };
      finalData.push(data);
    });
    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        cartItems: finalData,
      }
    );
    return res.status(201).send({ message: "Cart managed" });
  })
);

module.exports = userRouter;
