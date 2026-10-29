const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["sale", "restock", "count"],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 }, // what the user entered
    change: { type: Number, required: true },           // effect on stock (+ or -)
    stockAfter: { type: Number, required: true },       // stock after this action
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockMovement", stockMovementSchema);