const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const { getReorderSuggestions } = require("../services/smartStock");

const router = express.Router();

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Turns a value into a number, or NaN if it is missing or not a number
function parseAmount(value) {
  if (value === undefined || value === null || value === "") return NaN;
  return Number(value);
}

// Uses the fallback when the value is missing or not a number
function numberOr(value, fallback) {
  const n = parseAmount(value);
  return Number.isFinite(n) ? n : fallback;
}

// POST /api/stock/sale  -> body: { productId, quantity, note }
router.post("/sale", async (req, res) => {
  try {
    const { productId, quantity, note } = req.body;
    const qty = parseAmount(quantity);

    if (!isValidId(productId)) {
      return res.status(400).json({ message: "A valid productId is required" });
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "quantity must be a number greater than 0" });
    }

    // Subtract only if there is enough stock. The check and the update
    // happen in one step, so two sales at once cannot make stock negative.
    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );

    if (!product) {
      const exists = await Product.exists({ _id: productId });
      if (!exists) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(400).json({ message: "Not enough stock for this sale" });
    }

    const movement = await StockMovement.create({
      product: product._id,
      type: "sale",
      quantity: qty,
      change: -qty,
      stockAfter: product.stock,
      note,
    });

    res.status(201).json({ product, movement });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/stock/restock  -> body: { productId, quantity, note }
router.post("/restock", async (req, res) => {
  try {
    const { productId, quantity, note } = req.body;
    const qty = parseAmount(quantity);

    if (!isValidId(productId)) {
      return res.status(400).json({ message: "A valid productId is required" });
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "quantity must be a number greater than 0" });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: qty } },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const movement = await StockMovement.create({
      product: product._id,
      type: "restock",
      quantity: qty,
      change: qty,
      stockAfter: product.stock,
      note,
    });

    res.status(201).json({ product, movement });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/stock/count  -> body: { productId, counted, note }
router.post("/count", async (req, res) => {
  try {
    const { productId, counted, note } = req.body;
    const countedQty = parseAmount(counted);

    if (!isValidId(productId)) {
      return res.status(400).json({ message: "A valid productId is required" });
    }
    if (!Number.isFinite(countedQty) || countedQty < 0) {
      return res.status(400).json({ message: "counted must be a number, 0 or more" });
    }

    // new: false returns the product as it was BEFORE the update,
    // so we can see what the system expected.
    const before = await Product.findByIdAndUpdate(
      productId,
      { stock: countedQty },
      { new: false }
    );
    if (!before) {
      return res.status(404).json({ message: "Product not found" });
    }

    const change = countedQty - before.stock;

    const movement = await StockMovement.create({
      product: before._id,
      type: "count",
      quantity: countedQty,
      change,
      stockAfter: countedQty,
      note,
    });

    res.status(201).json({
      name: before.name,
      previousStock: before.stock,
      newStock: countedQty,
      change,
      movement,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/stock/movements?productId=...  -> latest 50 records
router.get("/movements", async (req, res) => {
  try {
    const filter = {};
    if (req.query.productId) {
      if (!isValidId(req.query.productId)) {
        return res.status(400).json({ message: "Invalid productId" });
      }
      filter.product = req.query.productId;
    }

    const movements = await StockMovement.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("product", "name unit");

    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/stock/reorder-suggestions?days=14&leadTimeDays=3
router.get("/reorder-suggestions", async (req, res) => {
  try {
    const suggestions = await getReorderSuggestions({
      days: numberOr(req.query.days, 14),
      leadTimeDays: numberOr(req.query.leadTimeDays, 3),
    });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;