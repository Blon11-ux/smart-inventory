const express = require("express");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

const router = express.Router();

// GET /api/products  -> list all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id  -> get one product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
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
    const product = await Product.create(req.body);

    // If the product starts with some stock, record it in the history too
    if (product.stock > 0) {
      await StockMovement.create({
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

// PUT /api/products/:id  -> edit product details (NOT stock)
router.put("/:id", async (req, res) => {
  try {
    // Stock may only change through /api/stock, so we remove it here
    const { stock, ...updates } = req.body;

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
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
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await StockMovement.deleteMany({ product: product._id });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;