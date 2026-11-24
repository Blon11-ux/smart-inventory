const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register  -> body: { shopName, email, password }
router.post("/register", async (req, res) => {
  try {
    const { shopName, email, password } = req.body || {};

    // Only accept plain text values (blocks sneaky objects sent as input)
    if (
      typeof shopName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !shopName.trim() ||
      !email.trim()
    ) {
      return res
        .status(400)
        .json({ message: "shopName, email and password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ shopName, email, passwordHash });

    res.status(201).json({
      token: createToken(user._id),
      user: { id: user._id, shopName: user.shopName, email: user.email },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This email is already registered" });
    }
    res.status(400).json({ message: error.message });
  }
});

// POST /api/auth/login  -> body: { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+passwordHash"
    );

    // Same message for "no such email" and "wrong password" on purpose,
    // so attackers cannot find out which emails exist.
    const passwordOk = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: createToken(user._id),
      user: { id: user._id, shopName: user.shopName, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me  -> who am I? (needs a token)
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: "Account no longer exists" });
    }
    res.json({ id: user._id, shopName: user.shopName, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;