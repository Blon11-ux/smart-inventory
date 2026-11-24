require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const requireAuth = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const stockRoutes = require("./routes/stockRoutes");

// Stop immediately if the secret is missing, instead of failing later
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing in .env");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json({ limit: "300kb" })); // room for a small photo

app.get("/", (req, res) => {
  res.json({ message: "Smart Inventory API is running" });
});

app.use("/api/auth", authRoutes);                     // open: register, login
app.use("/api/products", requireAuth, productRoutes); // login required
app.use("/api/stock", requireAuth, stockRoutes);      // login required

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});