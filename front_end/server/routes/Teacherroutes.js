const express = require("express");
const router  = express.Router();
const teacherController = require("../controllers/teacherController");
const verifyToken       = require("../middleware/verifyToken");
const upload = require("../middleware/upload");

router.post(
  "/avatar",
  verifyToken,
  upload.single("avatar"), // 🔥 MUST match frontend
  teacherController.uploadAvatar
);

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/register", teacherController.register);
router.post("/login",    teacherController.login);
router.get ("/confirm",  teacherController.confirmEmail); // ?token=xxx

// ── Protected ─────────────────────────────────────────────────────────────────
router.get ("/profile",      verifyToken, teacherController.getProfile);
router.put ("/profile",      verifyToken, teacherController.updateProfile);
router.post("/verify-email", verifyToken, teacherController.sendVerification);
router.post("/avatar",       verifyToken, teacherController.uploadAvatar);

module.exports = router;