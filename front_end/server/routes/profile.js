const express = require("express");
const router = express.Router();
const db = require("../db");
const path = require("path");
const multer = require("multer");
const verifyToken = require("../middleware/authMiddleware");

// Multer config for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// GET PROFILE
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, bio, role, profileImage FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("GET profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PROFILE
router.put("/", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { name, phone, bio } = req.body;

  try {
    await db.query(
      "UPDATE users SET name = ?, phone = ?, bio = ? WHERE id = ?",
      [name, phone, bio, userId]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("UPDATE profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Upload profile image (NEW)
router.post("/upload-image", verifyToken, upload.single("profileImage"), async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filename = req.file.filename;

  try {
    await db.query(
      "UPDATE users SET profileImage = ? WHERE id = ?",
      [filename, userId]
    );

    res.json({ profileImage: filename });
  } catch (err) {
    console.error("Upload image error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;