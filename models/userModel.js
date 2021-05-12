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
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    wishlist: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
    ],
    cartItems: [],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
