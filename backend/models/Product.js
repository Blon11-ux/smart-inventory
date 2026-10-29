const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: { type: Number, required: true, min: 0 }, // selling price
    cost: { type: Number, default: 0, min: 0 },      // buying price
    stock: { type: Number, default: 0, min: 0 },     // how many we have
    minStock: { type: Number, default: 5, min: 0 },  // warn when below this
    unit: { type: String, default: "pcs" },          // pcs, kg, litre...
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Product", productSchema);