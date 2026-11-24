const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false means this is hidden unless we ask for it on purpose
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);