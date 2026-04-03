import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getTeacherProfile,
  updateTeacherProfile,
  sendVerificationEmail,
  uploadAvatar,
} from "../services/teacherAPI";
const BASE_URL = "http://localhost:5000";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};


const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  camera:   "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z",
  verified: "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
  pending:  "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  save:     "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8",
  mail:     "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  phone:    "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.06-1.06a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  close:    "M18 6L6 18 M6 6l12 12",
  back:     "M19 12H5 M12 19l-7-7 7-7",
  link:     "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  users:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  book:     "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  earnings: "M12 2v20 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  check:    "M20 6L9 17l-5-5",
};

const SUBJECTS = [
  "Mathematics","Physics","Chemistry","Biology","English",
  "History","Geography","Computer Science","Economics",
  "Accountancy","Hindi","Sanskrit",
];

const BLOCKED_DOMAINS = [
  "gmail.com","yahoo.com","hotmail.com","outlook.com",
  "rediffmail.com","icloud.com","yahoo.in","live.com",
];

const isInstitutionEmail = (email) => {
  const domain = (email.split("@")[1] || "").toLowerCase();
  return !BLOCKED_DOMAINS.includes(domain);
};

// ── Small components ──────────────────────────────────────────────────────────
function VerificationBadge({ status }) {
  const cfg = {
    verified: { bg: "#E1F5EE", color: "#0F6E56", icon: icons.verified, label: "Verified Teacher" },
    pending:  { bg: "#FAEEDA", color: "#854F0B", icon: icons.pending,  label: "Pending Verification" },
    none:     { bg: "#F1EFE8", color: "#888",    icon: icons.pending,  label: "Not Verified" },
  };
  const s = cfg[status] || cfg.none;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
    }}>
      <Icon d={s.icon} size={13}/>{s.label}
    </span>
  );
}

function SubjectTag({ label, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: "#E1F5EE", color: "#0F6E56",
      fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 20,
    }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#0F6E56", padding: 0, display: "flex", alignItems: "center",
        }}><Icon d={icons.close} size={11}/></button>
      )}
    </span>
  );
}

function Field({ label, children, hint, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600,
        color: "#666", marginBottom: 6 }}>{label}</label>
      {children}
      {hint  && !error && <p style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>{hint}</p>}
      {error &&           <p style={{ fontSize: 11, color: "#D85A30", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", error, icon, disabled }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{ position: "absolute", left: 10, top: "50%",
          transform: "translateY(-50%)", color: "#ccc" }}>
          <Icon d={icon} size={14}/>
        </span>
      )}
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: "100%", padding: "9px 12px",
          paddingLeft: icon ? 32 : 12,
          border: `0.5px solid ${error ? "#D85A30" : focus ? "#1D9E75" : "#e8e8e5"}`,
          borderRadius: 8, fontSize: 13, color: "#1a1a1a",
          background: disabled ? "#fafaf8" : "#fff", outline: "none",
          fontFamily: "'DM Sans',sans-serif",
          transition: "border-color 0.15s", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function DynamicStatCard({ label, value, icon, suffix = "" }) {
  return (
    <div style={{
      background: "#f7f7f5", borderRadius: 10,
      padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ color: "#1D9E75" }}><Icon d={icon} size={16}/></div>
      <p style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Outfit',sans-serif" }}>
        {value !== null && value !== undefined ? `${value}${suffix}` : "—"}
      </p>
      <p style={{ fontSize: 11, color: "#bbb" }}>{label}</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TeacherProfile() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const fileRef   = useRef(null);

  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [editing,         setEditing]         = useState(false);
  const [error,           setError]           = useState("");
  const [toast,           setToast]           = useState("");
  const [profilePic,      setProfilePic]      = useState(null);
  const [verifyStatus,    setVerifyStatus]    = useState("none");
  const [verifyEmailSent, setVerifyEmailSent] = useState(false);
  const [instEmailError,  setInstEmailError]  = useState("");
  const [sendingVerify,   setSendingVerify]   = useState(false);

  // Dynamic stats from backend
  const [stats, setStats] = useState({
    totalStudents: null,
    activeRooms:   null,
    totalEarnings: null,
  });

  const [form, setForm] = useState({
    name: "", personalEmail: "", phone: "", bio: "",
    institutionEmail: "", institutionName: "",
    experience: "", subjects: [], website: "",
  });
  const [draft,        setDraft]        = useState({ ...form });
  const [subjectInput, setSubjectInput] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getTeacherProfile();
        if (!data.name) throw new Error(data.message || "Failed to load");

        const mapped = {
          name:             data.name             || "",
          personalEmail:    data.personal_email   || "",
          phone:            data.phone            || "",
          bio:              data.bio              || "",
          institutionEmail: data.institution_email || "",
          institutionName:  data.institution_name  || "",
          experience:       String(data.experience_years || ""),
          subjects:         Array.isArray(data.subjects) ? data.subjects : [],
          website:          data.website          || "",
        };
        setForm(mapped);
        setDraft(mapped);
        setProfilePic(getImageUrl(data.profile_pic));
        setVerifyStatus(data.is_verified ? "verified" : data.institution_email ? "pending" : "none");

        // Dynamic stats — from backend (these grow as students join)
        setStats({
          totalStudents: data.total_students ?? 0,
          activeRooms:   data.active_rooms   ?? 0,
          totalEarnings: data.total_earnings ?? 0,
        });
      } catch (err) {
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    // Check redirect after email verification
    const params = new URLSearchParams(location.search);
    if (params.get("verified") === "true") {
      showToast("Email verified! You are now a Verified Teacher ✓");
      setVerifyStatus("verified");
    }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateTeacherProfile({
        name:       draft.name,
        phone:      draft.phone,
        bio:        draft.bio,
        subjects:   draft.subjects,
        experience: draft.experience,
        website:    draft.website,
      });
      if (res.message === "Profile updated successfully.") {
        setForm({ ...draft });
        setEditing(false);
        showToast("Profile saved successfully!");
      } else {
        setError(res.message || "Failed to save profile.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePic(reader.result);
    reader.readAsDataURL(file);
    try {
      const res = await uploadAvatar(file);
      if (res.profilePic) setProfilePic(getImageUrl(res.profilePic));
    } catch {
      showToast("Avatar upload failed.");
    }
  };

  const handleSendVerification = async () => {
    if (!draft.institutionEmail) { setInstEmailError("Please enter your institution email."); return; }
    if (!isInstitutionEmail(draft.institutionEmail)) {
      setInstEmailError("Use your school or college email — not Gmail, Yahoo, etc."); return;
    }
    setInstEmailError("");
    setSendingVerify(true);
    try {
      const res = await sendVerificationEmail(draft.institutionEmail, draft.institutionName);
      if (res.message) { setVerifyStatus("pending"); setVerifyEmailSent(true); showToast("Verification email sent!"); }
    } catch {
      setInstEmailError("Failed to send. Please try again.");
    } finally {
      setSendingVerify(false);
    }
  };

  const handleCancel = () => { setDraft({ ...form }); setEditing(false); setInstEmailError(""); };
  const set          = (key) => (val) => setDraft(d => ({ ...d, [key]: val }));
  const addSubject   = (s)   => { if (s && !draft.subjects.includes(s)) setDraft(d => ({ ...d, subjects: [...d.subjects, s] })); setSubjectInput(""); };
  const removeSubject= (s)   => setDraft(d => ({ ...d, subjects: d.subjects.filter(x => x !== s) }));

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f7f7f5",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); }}`}</style>
      <div style={{ width: 36, height: 36, borderRadius: "50%",
        border: "3px solid #E1F5EE", borderTop: "3px solid #1D9E75",
        animation: "spin 0.7s linear infinite" }}/>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#f7f7f5",
      fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: "32px 24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20,
          background: "#1D9E75", color: "#fff",
          padding: "11px 18px", borderRadius: 10,
          fontSize: 13, fontWeight: 600, zIndex: 100,
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 20px rgba(29,158,117,0.25)",
        }}>
          <Icon d={icons.check} size={14}/> {toast}
        </div>
      )}

      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Back button */}
        <button onClick={() => navigate("/teacher-dashboard")} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          color: "#bbb", fontSize: 13, fontWeight: 500,
          marginBottom: 20, padding: 0, transition: "color 0.13s",
        }}
          onMouseEnter={e => e.currentTarget.style.color="#1D9E75"}
          onMouseLeave={e => e.currentTarget.style.color="#bbb"}
        >
          <Icon d={icons.back} size={15}/> Back to Dashboard
        </button>

        {/* Error banner */}
        {error && (
          <div style={{
            background: "#FAECE7", border: "0.5px solid #D85A30",
            borderRadius: 10, padding: "12px 16px", marginBottom: 16,
            fontSize: 13, color: "#993C1D",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            {error}
            <button onClick={() => setError("")} style={{
              background: "none", border: "none", cursor: "pointer", color: "#993C1D",
            }}><Icon d={icons.close} size={14}/></button>
          </div>
        )}

        {/* ── Header card ── */}
        <div style={{
          background: "#fff", borderRadius: 16,
          border: "0.5px solid #e8e8e5",
          padding: "28px 28px 24px", marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 22 }}>

            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: "#9FE1CB", border: "3px solid #E1F5EE",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                {profilePic
                  ? <img src={getImageUrl(profilePic)} alt="profile"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                  : <span style={{ fontSize: 30, fontWeight: 700, color: "#0F6E56",
                      fontFamily: "'Outfit',sans-serif" }}>
                      {form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "T"}
                    </span>
                }
              </div>
              <button onClick={() => fileRef.current.click()} style={{
                position: "absolute", bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: "50%",
                background: "#1D9E75", border: "2.5px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff",
              }}>
                <Icon d={icons.camera} size={13}/>
              </button>
              <input ref={fileRef} type="file" accept="image/*"
                onChange={handlePicChange} style={{ display: "none" }}/>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a",
                  fontFamily: "'Outfit',sans-serif" }}>{form.name || "Your Name"}</h1>
                <VerificationBadge status={verifyStatus}/>
              </div>
              <p style={{ fontSize: 13, color: "#bbb", marginBottom: 10 }}>
                {form.experience ? `${form.experience} yrs experience` : "Teacher"}
                {form.subjects.length > 0 && ` · ${form.subjects.slice(0, 3).join(", ")}${form.subjects.length > 3 ? ` +${form.subjects.length-3}` : ""}`}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {form.subjects.map(s => <SubjectTag key={s} label={s}/>)}
              </div>
            </div>

            {/* Edit toggle */}
            <button onClick={() => editing ? handleCancel() : setEditing(true)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px",
              background: editing ? "#f5f5f3" : "#1D9E75",
              color: editing ? "#777" : "#fff",
              border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0,
              transition: "background 0.13s",
            }}>
              <Icon d={editing ? icons.close : icons.edit} size={14}/>
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* ── Dynamic stats row (from backend) ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3,1fr)",
            gap: 12, marginTop: 22, paddingTop: 20,
            borderTop: "0.5px solid #f0f0ee",
          }}>
            <DynamicStatCard
              label="Total Students"
              value={stats.totalStudents}
              icon={icons.users}
            />
            <DynamicStatCard
              label="Active Rooms"
              value={stats.activeRooms}
              icon={icons.book}
            />
            <DynamicStatCard
              label="Total Earnings"
              value={stats.totalEarnings !== null ? `₹${stats.totalEarnings.toLocaleString("en-IN")}` : null}
              icon={icons.earnings}
            />
          </div>
          {/* Note about dynamic stats */}
          <p style={{ fontSize: 11, color: "#ccc", marginTop: 10, textAlign: "right" }}>
            Stats update automatically as students join your rooms.
          </p>
        </div>

        {/* ── Form grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Basic info */}
            <div style={{ background: "#fff", borderRadius: 14,
              border: "0.5px solid #e8e8e5", padding: "20px" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a",
                marginBottom: 18, fontFamily: "'Outfit',sans-serif" }}>Basic Information</p>

              <Field label="Full Name">
                {editing
                  ? <TextInput value={draft.name} onChange={set("name")} placeholder="Your full name"/>
                  : <p style={{ fontSize: 13, color: "#333", padding: "9px 0" }}>{form.name || "—"}</p>}
              </Field>

              <Field label="Personal Email" hint="Used for login — cannot be changed here">
                <TextInput value={form.personalEmail} onChange={() => {}}
                  placeholder="personal@gmail.com" icon={icons.mail} disabled/>
              </Field>

              <Field label="Phone Number">
                {editing
                  ? <TextInput value={draft.phone} onChange={set("phone")}
                      placeholder="+91 XXXXX XXXXX" icon={icons.phone}/>
                  : <p style={{ fontSize: 13, color: "#333", padding: "9px 0" }}>
                      {form.phone || "Not added"}
                    </p>}
              </Field>

              <Field label="Years of Experience">
                {editing
                  ? <TextInput value={draft.experience} onChange={set("experience")}
                      placeholder="e.g. 8" type="number"/>
                  : <p style={{ fontSize: 13, color: "#333", padding: "9px 0" }}>
                      {form.experience ? `${form.experience} years` : "Not added"}
                    </p>}
              </Field>

              <Field label="Website / LinkedIn" hint="Optional">
                {editing
                  ? <TextInput value={draft.website} onChange={set("website")}
                      placeholder="https://yoursite.com" icon={icons.link}/>
                  : <p style={{ fontSize: 13, padding: "9px 0",
                      color: form.website ? "#185FA5" : "#bbb" }}>
                      {form.website || "Not added"}
                    </p>}
              </Field>
            </div>

            {/* Bio */}
            <div style={{ background: "#fff", borderRadius: 14,
              border: "0.5px solid #e8e8e5", padding: "20px" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a",
                marginBottom: 16, fontFamily: "'Outfit',sans-serif" }}>About Me</p>
              {editing
                ? <textarea
                    value={draft.bio}
                    onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                    rows={5} placeholder="Tell students about yourself..."
                    style={{
                      width: "100%", padding: "9px 12px",
                      border: "0.5px solid #e8e8e5", borderRadius: 8,
                      fontSize: 13, color: "#1a1a1a", resize: "vertical",
                      fontFamily: "'DM Sans',sans-serif", outline: "none",
                      boxSizing: "border-box", lineHeight: 1.65,
                    }}/>
                : <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>
                    {form.bio || "No bio added yet."}
                  </p>}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Subjects */}
            <div style={{ background: "#fff", borderRadius: 14,
              border: "0.5px solid #e8e8e5", padding: "20px" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a",
                marginBottom: 16, fontFamily: "'Outfit',sans-serif" }}>Subjects I Teach</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: editing ? 12 : 0 }}>
                {(editing ? draft.subjects : form.subjects).map(s => (
                  <SubjectTag key={s} label={s} onRemove={editing ? () => removeSubject(s) : null}/>
                ))}
                {(editing ? draft.subjects : form.subjects).length === 0 && (
                  <p style={{ fontSize: 13, color: "#bbb" }}>No subjects added yet</p>
                )}
              </div>
              {editing && (
                <select
                  value={subjectInput}
                  onChange={e => { addSubject(e.target.value); setSubjectInput(""); }}
                  style={{
                    width: "100%", padding: "9px 12px",
                    border: "0.5px solid #e8e8e5", borderRadius: 8,
                    fontSize: 13, color: "#333", background: "#fff",
                    fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer",
                  }}>
                  <option value="">+ Add a subject</option>
                  {SUBJECTS.filter(s => !draft.subjects.includes(s)).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Verification */}
            <div style={{
              background: "#fff", borderRadius: 14,
              border: `0.5px solid ${verifyStatus === "verified" ? "#1D9E75" : "#e8e8e5"}`,
              padding: "20px",
            }}>
              <div style={{ display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a",
                  fontFamily: "'Outfit',sans-serif" }}>Teacher Verification</p>
                <VerificationBadge status={verifyStatus}/>
              </div>

              {verifyStatus === "verified" ? (
                <div style={{ background: "#E1F5EE", borderRadius: 10, padding: "12px 14px" }}>
                  <p style={{ fontSize: 13, color: "#0F6E56", fontWeight: 600 }}>
                    ✓ Verified via {form.institutionEmail}
                  </p>
                  {form.institutionName && (
                    <p style={{ fontSize: 12, color: "#1D9E75", marginTop: 3 }}>{form.institutionName}</p>
                  )}
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14, lineHeight: 1.55 }}>
                    Add your school or college email to get a verified badge and unlock paid rooms.
                  </p>
                  <Field label="Institution Email" error={instEmailError}
                    hint="e.g. you@school.edu.in — not Gmail or Yahoo">
                    <TextInput
                      value={draft.institutionEmail}
                      onChange={v => { set("institutionEmail")(v); setInstEmailError(""); }}
                      placeholder="you@yourschool.edu.in"
                      icon={icons.mail} error={instEmailError}/>
                  </Field>
                  <Field label="Institution Name" hint="Optional">
                    <TextInput value={draft.institutionName} onChange={set("institutionName")}
                      placeholder="e.g. Delhi Public School"/>
                  </Field>

                  {verifyEmailSent ? (
                    <div style={{ background: "#FAEEDA", borderRadius: 10, padding: "12px 14px" }}>
                      <p style={{ fontSize: 12, color: "#854F0B", fontWeight: 600 }}>
                        Verification email sent to {draft.institutionEmail}
                      </p>
                      <p style={{ fontSize: 11, color: "#854F0B", marginTop: 3 }}>
                        Check your inbox and click the link. Expires in 24 hours.
                      </p>
                    </div>
                  ) : (
                    <button onClick={handleSendVerification} disabled={sendingVerify} style={{
                      width: "100%", padding: "9px",
                      background: sendingVerify ? "#9FE1CB" : "#1D9E75",
                      color: "#fff", border: "none", borderRadius: 8,
                      fontSize: 13, fontWeight: 600,
                      cursor: sendingVerify ? "not-allowed" : "pointer",
                    }}>
                      {sendingVerify ? "Sending…" : "Send Verification Email"}
                    </button>
                  )}

                  <div style={{ marginTop: 12, padding: "10px 12px",
                    background: "#f7f7f5", borderRadius: 8 }}>
                    <p style={{ fontSize: 11, color: "#999", fontWeight: 600, marginBottom: 4 }}>
                      Without verification you cannot:
                    </p>
                    {["Create paid rooms","Appear in marketplace","Withdraw earnings"].map(item => (
                      <p key={item} style={{ fontSize: 11, color: "#bbb", marginBottom: 2 }}>· {item}</p>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Save */}
            {editing && (
              <button onClick={handleSave} disabled={saving} style={{
                width: "100%", padding: "12px",
                background: saving ? "#9FE1CB" : "#1D9E75",
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "'Outfit',sans-serif", transition: "background 0.13s",
              }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background="#0F6E56"; }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background="#1D9E75"; }}
              >
                <Icon d={icons.save} size={16}/>
                {saving ? "Saving…" : "Save Profile"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}