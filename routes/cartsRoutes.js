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
module.exports = cartRouter;
