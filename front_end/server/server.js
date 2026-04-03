const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const teacherRoutes = require("./routes/teacherRoutes"); // ✅ ADDED
const verifyToken = require("./middleware/authMiddleware");
const collabRoutes = require("./routes/collabRoutes");


const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/collaboration", collabRoutes);

// ✅ ADDED (this fixes your 404 issue)
app.use("/api/teacher", teacherRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("TutorX Backend Running");
});

// Protected Dashboard
app.get("/api/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Protected data",
    user: req.user
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});