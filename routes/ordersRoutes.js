const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const orderRouter = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");
const isAuth = require("../middlewares/authMiddleware");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

orderRouter.post(
  "/stripe/payment/charge",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { token, items, totalPrice, address } = req.body;
    const idempotencyKey = uuidv4();
    return stripe.customers
      .create({
        email: token.email,
        source: token.id,
      })
      .then((customer) => {
        stripe.charges
          .create(
            {
              amount: parseInt((totalPrice * 100).toString().split(".")[0]),
              currency: "usd",
              customer: customer.id,
              receipt_email: token.email,
              description: `order placed successfully for worth of ${totalPrice}`,
            },
            { idempotencyKey }
          )
          .then(async (result) => {
            const order = new Order({
              userID: req.user._id,
              items: items,
              address: address,
              itemPrice: req.body.totalAmt,
              shippingPrice: req.body.shippingPrice,
              taxPrice: req.body.taxPrice,
              totalPrice: totalPrice,
              status: "Not Delivered",
            });
            order.save();
            await User.findByIdAndUpdate(req.user._id, { cartItems: [] });
            res.status(200).json(result);
          })
          .catch((error) => {
            console.log(error);
            res.status(404).json(error);
          });
      })
      .catch((error) => {
        console.log(error);
        res.status(404).json(error);
      });
  })
);

orderRouter.post(
  "/get-order-list",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const limit = req.body.limit || 9;
    let skip = (req.body.page - 1) * 9 || 0;
    const order = await Order.find({
      userID: mongoose.Types.ObjectId(req.user._id),
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    let orderCount = await Order.countDocuments();
    orderCount = Math.ceil(orderCount / limit);
    if (order) {
      return res.status(200).send({
        message: "order list fetched successfully",
        data: order,
        totalPage: orderCount,
      });
    } else {
      return res.status(200).send({
        message: "order list fetched successfully",
        data: [],
        totalPage: 0,
      });
    }
    res.status(200).send(order);
  })
);

module.exports = orderRouter;
