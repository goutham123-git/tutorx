// middleware/authMiddleware.js
// Single unified middleware — works for both teachers and students
// Sets req.user = decoded JWT payload
// Sets req.teacher = { id: decoded.id } for teacher routes

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Set BOTH so all routes work ───────────────────────────────────────────
    req.user    = decoded;           // decoded.id = user_id from users table
    req.teacher = { id: decoded.id }; // used by teacher routes & collab routes

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = verifyToken;