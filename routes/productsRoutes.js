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
    const limit = req.body.limit || 12;
    let skip = (req.body.page - 1) * 12 || 0;
    var searchQuery = {};
    if (req.body.filterKeyword) {
      searchQuery.title = {
        $regex: req.body.filterKeyword.trim(),
        $options: "i",
      };
    }
    const productList = await Product.find(searchQuery).skip(skip).limit(limit);
    let productcount = await Product.countDocuments(searchQuery);
    productcount = Math.ceil(productcount / limit);
    if (productList) {
      return res.status(200).send({
        message: "product list fetched successfully",
        data: productList,
        totalProduct: productcount,
      });
    } else {
      return res.status(200).send({
        message: "product list fetched successfully",
        data: [],
        totalProduct: 0,
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
