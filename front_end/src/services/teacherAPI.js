// src/services/teacherAPI.js
// All frontend API calls for teacher routes

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/teacher";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerTeacher = async (name, email, password) => {
  const res = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
};

export const loginTeacher = async (email, password) => {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({ ...data.teacher, role: "teacher" }));
  }
  return data;
};

export const logoutTeacher = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ── Profile ───────────────────────────────────────────────────────────────────
// Returns: name, personal_email, phone, bio, profile_pic,
//          institution_email, institution_name, is_verified,
//          subjects (array), experience_years, website,
//          total_students, active_rooms, total_earnings  ← dynamic stats
export const getTeacherProfile = async () => {
  const res = await fetch(`${BASE}/profile`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const updateTeacherProfile = async (profileData) => {
  const res = await fetch(`${BASE}/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(profileData),
  });
  return res.json();
};

// ── Verification ──────────────────────────────────────────────────────────────
export const sendVerificationEmail = async (institutionEmail, institutionName) => {
  const res = await fetch(`${BASE}/verify-email`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ institutionEmail, institutionName }),
  });
  return res.json();
};

// ── Avatar ────────────────────────────────────────────────────────────────────
export const uploadAvatar = async (file) => {
  const formData = new FormData();

  formData.append("avatar", file); // 🔥 THIS NAME IS CRITICAL

  const res = await fetch("http://localhost:5000/api/teacher/avatar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: formData
  });

  return res.json();
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};