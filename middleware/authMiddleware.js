// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { user_id, email, role }
    next(); // Go to the next middleware or route
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticate;
