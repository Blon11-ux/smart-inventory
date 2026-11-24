const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
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
    // A small photo stored as text ("data URL"). Empty means no photo.
    photo: {
      type: String,
      default: "",
      maxlength: [150000, "Photo is too large"],
      validate: {
        validator: (value) =>
          value === "" ||
          /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value),
        message: "Photo must be a JPEG, PNG or WebP image",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);