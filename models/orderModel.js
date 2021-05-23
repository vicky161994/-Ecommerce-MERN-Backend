const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    items: {
      type: Array,
      required: true,
    },
    address: {
      type: Array,
      required: true,
    },
    itemPrice: {
      type: String,
      required: true,
    },
    shippingPrice: {
      type: String,
      required: true,
    },
    taxPrice: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
