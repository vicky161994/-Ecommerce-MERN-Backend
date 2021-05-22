const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const orderRouter = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");
const isAuth = require("../middlewares/authMiddleware");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

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
              totalPrice: totalPrice,
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

module.exports = orderRouter;
