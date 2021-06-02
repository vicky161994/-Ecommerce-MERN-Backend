const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const cartRouter = express.Router();
const User = require("../models/userModel");
const Product = require("../models/productModel");
const isAuth = require("../middlewares/authMiddleware");
const mongoose = require("mongoose");

cartRouter.get(
  "/get-cart-item-list",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const stages = [
      { $match: { _id: { $eq: mongoose.Types.ObjectId(req.user._id) } } },
      { $unwind: "$cartItems" },
      {
        $lookup: {
          from: "products",
          localField: "cartItems.productId",
          foreignField: "_id",
          as: "cartList",
        },
      },
      { $unwind: "$cartList" },
      { $project: { cartItems: 1, cartList: 1, _id: 0 } },
    ];
    let cartItems = await User.aggregate(stages);
    cartItems = cartItems.map((cart, index) => {
      return { cartList: cart.cartList, qty: cart.cartItems.qty };
    });
    return res.status(200).send({ data: cartItems });
  })
);

cartRouter.post(
  "/delete-item-from-cart",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (!req.body.productId) {
      return res.status(401).send("Product ID is missing");
    }
    await User.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(req.user._id),
      },
      {
        $pull: {
          cartItems: { productId: mongoose.Types.ObjectId(req.body.productId) },
        },
      }
    );
    const updatedcartItems = await User.findById(req.user._id, {
      cartItems: 1,
      _id: 0,
    });
    return res.status(200).send({ status: 200, data: updatedcartItems });
  })
);

cartRouter.post(
  "/manage-item-qty",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    await User.updateOne(
      {
        _id: mongoose.Types.ObjectId(req.user._id),
        "cartItems.productId": mongoose.Types.ObjectId(req.body.productId),
      },
      {
        $set: { "cartItems.$.qty": req.body.qty },
      }
    );
    return res.status(200).send({ status: 200, message: "quantity changed" });
  })
);

cartRouter.post(
  "/unauth-get-cart-item-list",
  expressAsyncHandler(async (req, res) => {
    const cartIDs = req.body.cartItems.map((cart) => cart.productId);
    let cartItems = await Product.find({
      _id: { $in: cartIDs },
    });
    const finanlData = [];
    cartItems = cartItems.map((cart, index) => {
      req.body.cartItems.map((product, index) => {
        if (product.productId == cart._id) {
          const data = { cartList: cart, qty: product.qty };
          finanlData.push(data);
          return finanlData;
        }
      });
    });
    return res.status(200).send({ data: finanlData });
  })
);

module.exports = cartRouter;
