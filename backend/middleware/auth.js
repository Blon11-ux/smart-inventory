const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  // The token arrives in the header: Authorization: Bearer <token>
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Please log in" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId; // routes can now use req.userId
    next();                      // continue to the route
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = requireAuth;