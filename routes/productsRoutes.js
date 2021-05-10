const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const productRouter = express.Router();
const Product = require("../models/productModel");

productRouter.post(
  "/feed-product",
  expressAsyncHandler(async (req, res) => {
    req.body.forEach(async (product) => {
      const saveproduct = new Product({
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image,
      });
      const createdProduct = await saveproduct.save();
    });

    res.send({
      message: "Product Saved Successfully",
      status: "201",
    });
  })
);

productRouter.post(
  "/get-product-list",
  expressAsyncHandler(async (req, res) => {
    const limit = req.body.limit || 9;
    let skip = (req.body.page - 1) * 9 || 0;
    const productList = await Product.find().skip(skip).limit(limit);
    if (productList) {
      return res.status(200).send({
        message: "product list fetched successfully",
        data: productList,
      });
    } else {
      return res.status(200).send({
        message: "product list fetched successfully",
        data: [],
      });
    }
  })
);

productRouter.post(
  "/get-product",
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.body._id);
    if (product) {
      return res.status(200).send({
        message: "product fetched successfully",
        data: product,
      });
    } else {
      return res.status(200).send({
        message: "product fetched successfully",
        data: {},
      });
    }
  })
);

module.exports = productRouter;
