const express = require("express");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

const router = express.Router();

// GET /api/products  -> list this shop's products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ shop: req.userId }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id  -> get one product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      shop: req.userId,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/products  -> add a new product
router.post("/", async (req, res) => {
  try {
    const { name, price, cost, stock, minStock, unit, photo } = req.body || {};

    // We pick the allowed fields ourselves, and the shop comes from the token.
    // A client can never choose which shop the product belongs to.
    const product = await Product.create({
      shop: req.userId,
      name,
      price,
      cost,
      stock,
      minStock,
      unit,
      photo,
    });

    // If the product starts with some stock, record it in the history too
    if (product.stock > 0) {
      await StockMovement.create({
        shop: req.userId,
        product: product._id,
        type: "restock",
        quantity: product.stock,
        change: product.stock,
        stockAfter: product.stock,
        note: "Opening stock",
      });
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/products/:id  -> edit product details (NOT stock, NOT shop)
router.put("/:id", async (req, res) => {
  try {
    const body = req.body || {};
    const updates = {};
    for (const field of ["name", "price", "cost", "minStock", "unit", "photo"]) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shop: req.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/products/:id  -> remove a product and its history
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      shop: req.userId,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await StockMovement.deleteMany({ product: product._id, shop: req.userId });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;