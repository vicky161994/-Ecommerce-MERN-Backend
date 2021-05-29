const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    loggedInVia: {
      type: String,
      required: false,
    },
    wishlist: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
    ],
    cartItems: [],
    address: [],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
