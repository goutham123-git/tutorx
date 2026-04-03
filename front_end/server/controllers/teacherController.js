const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const crypto = require("crypto");
const db     = require("../db");
const mailer = require("../utils/emailHelper");

const BLOCKED_DOMAINS = [
  "gmail.com","yahoo.com","hotmail.com","outlook.com",
  "rediffmail.com","icloud.com","yahoo.in","live.com",
];

const isInstitutionEmail = (email) => {
  const domain = (email.split("@")[1] || "").toLowerCase();
  return !BLOCKED_DOMAINS.includes(domain);
};

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required." });

    const [existing] = await db.query(
      "SELECT id FROM teachers WHERE personal_email = ?", [email]
    );
    if (existing.length > 0)
      return res.status(409).json({ message: "Email already registered." });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      `INSERT INTO teachers (name, personal_email, password_hash, is_verified, created_at)
       VALUES (?, ?, ?, FALSE, NOW())`,
      [name, email, hash]
    );

    const token = jwt.sign(
      { id: result.insertId, role: "teacher" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registered successfully.",
      token,
      teacher: { id: result.insertId, name, email, is_verified: false },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required." });

    const [rows] = await db.query(
      "SELECT * FROM teachers WHERE personal_email = ?", [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid email or password." });

    const teacher = rows[0];
    const match = await bcrypt.compare(password, teacher.password_hash);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password." });

    await db.query(
      "UPDATE teachers SET last_login = NOW() WHERE id = ?", [teacher.id]
    );

    const token = jwt.sign(
      { id: teacher.id, role: "teacher" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful.",
      token,
      teacher: {
        id:          teacher.id,
        name:        teacher.name,
        email:       teacher.personal_email,
        profilePic:  teacher.profile_pic,
        is_verified: teacher.is_verified,
        last_login:  teacher.last_login,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Get Profile (with dynamic stats) ─────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ keep this

    const [rows] = await db.query(
      `SELECT 
          id,
          name,
          personal_email,
          phone,
          bio,
          profile_pic,
          institution_email,
          institution_name,
          is_verified,
          subjects,
          experience_years,
          website,
          created_at,
          last_login
       FROM teachers 
       WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Teacher not found." });

    const t = rows[0];

    res.json({
      ...t,
      subjects: t.subjects ? t.subjects.split(",") : [],
    });

  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
// ── Update Profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, phone, bio, subjects, experience, website } = req.body;

    await db.query(
      `UPDATE teachers
       SET name=?, phone=?, bio=?, subjects=?, experience_years=?, website=?
       WHERE user_id=?`,
      [
        name,
        phone,
        bio,
        Array.isArray(subjects) ? subjects.join(",") : subjects,
        experience,
        website,
        userId
      ]
    );

    res.json({ message: "Profile updated successfully." });

  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Send Verification Email ───────────────────────────────────────────────────
exports.sendVerification = async (req, res) => {
  try {
    const { institutionEmail, institutionName } = req.body;

    if (!institutionEmail)
      return res.status(400).json({ message: "Institution email is required." });

    if (!isInstitutionEmail(institutionEmail))
      return res.status(400).json({
        message: "Please use your school or college email, not a personal email.",
      });

    const token   = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.query(
  `UPDATE teachers
   SET institution_email=?, institution_name=?,
       verification_token=?, token_expires_at=?
   WHERE id=?`,
  [institutionEmail, institutionName || null, token, expires, req.user.id] // ✅ FIXED
);

    const link = `${process.env.CLIENT_URL}/verify-teacher?token=${token}`;
    await mailer.sendVerificationEmail(institutionEmail, link);

    res.json({ message: "Verification email sent. Check your inbox." });
  } catch (err) {
    console.error("Send verification error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Confirm Email Token ───────────────────────────────────────────────────────
exports.confirmEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).json({ message: "Token missing." });

    const [rows] = await db.query(
      `SELECT id FROM teachers
       WHERE verification_token = ? AND token_expires_at > NOW()`,
      [token]
    );
    if (rows.length === 0)
      return res.status(400).json({ message: "Invalid or expired token." });

    await db.query(
      `UPDATE teachers
       SET is_verified=TRUE, verified_at=NOW(), verification_token=NULL
       WHERE id=?`,
      [rows[0].id]
    );

    res.redirect(`${process.env.CLIENT_URL}/teacher-profile?verified=true`);
  } catch (err) {
    console.error("Confirm email error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Upload Avatar ─────────────────────────────────────────────────────────────
// In teacherController.js — uploadAvatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = `/uploads/avatars/${req.file.filename}`;

    await db.query(
      "UPDATE teachers SET profile_pic=? WHERE user_id=?",
      [filePath, req.user.id]
    );

    res.json({ message: "Avatar updated.", profilePic: filePath });

  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ message: "Server error." });
  }
};