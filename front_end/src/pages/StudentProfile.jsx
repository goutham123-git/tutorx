import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function StudentProfile() {
  const [user, setUser] = useState({
    name: "", email: "", phone: "", bio: "", profileImage: ""
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setUser({
        name: res.data?.name || "",
        email: res.data?.email || "",
        phone: res.data?.phone || "",
        bio: res.data?.bio || "",
        profileImage: res.data?.profileImage || ""
      });
      setLoading(false);
    })
    .catch(() => {
      setMessage({ text: "Failed to load profile.", type: "error" });
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // ✅ Profile image upload handler
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview instantly
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);

    // Upload to backend
    const formData = new FormData();
    formData.append("profileImage", file);

    setUploading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/profile/upload-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      setUser((prev) => ({ ...prev, profileImage: res.data.profileImage }));
      setMessage({ text: "✅ Photo updated!", type: "success" });
    } catch {
      setMessage({ text: "❌ Image upload failed.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axios.put(
        "http://localhost:5000/api/profile",
        { name: user.name, phone: user.phone, bio: user.bio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: "Profile saved successfully!", type: "success" });
    } catch {
      setMessage({ text: "Profile update failed.", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const avatarSrc = previewImage
    || (user.profileImage ? `http://localhost:5000/uploads/${user.profileImage}` : null)
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=0f172a&color=e2e8f0&size=128&bold=true`;

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div style={styles.page}>
        {/* Background blobs */}
        <div style={styles.blob1} />
        <div style={styles.blob2} />

        <div style={styles.card} className="profile-card">

          {/* Header bar */}
          <div style={styles.cardHeader}>
            <span style={styles.headerLabel}>STUDENT PROFILE</span>
            <span style={styles.headerDot} />
          </div>

          {/* Avatar section */}
          <div style={styles.avatarSection}>
            <div style={styles.avatarRing} className="avatar-ring">
              <div style={styles.avatarWrap}>
                <img src={avatarSrc} alt="Profile" style={styles.avatar} />
                {uploading && <div style={styles.uploadOverlay}><div style={styles.spinnerSm} /></div>}
              </div>
              <button
                style={styles.cameraBtn}
                className="camera-btn"
                onClick={() => fileInputRef.current.click()}
                title="Change photo"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
            <h2 style={styles.userName}>{user.name || "Your Name"}</h2>
            <span style={styles.userRole}>Student</span>
          </div>

          {/* Toast message */}
          {message.text && (
            <div style={{
              ...styles.toast,
              background: message.type === "success" ? "#052e16" : "#2d0a0a",
              borderColor: message.type === "success" ? "#16a34a" : "#dc2626",
              color: message.type === "success" ? "#4ade80" : "#f87171"
            }} className="toast-in">
              {message.text}
            </div>
          )}

          {/* Form */}
          <div style={styles.form}>
            {[
              { label: "Full Name", name: "name", type: "text", placeholder: "Your full name", editable: true },
              { label: "Email Address", name: "email", type: "email", placeholder: "", editable: false },
              { label: "Phone Number", name: "phone", type: "text", placeholder: "+1 (555) 000-0000", editable: true },
            ].map((field) => (
              <div key={field.name} style={styles.fieldWrap}>
                <label style={styles.label}>{field.label}</label>
                <div style={{
                  ...styles.inputWrap,
                  ...(activeField === field.name ? styles.inputWrapActive : {}),
                  ...(field.editable ? {} : styles.inputWrapDisabled)
                }}>
                  <input
                    type={field.type}
                    name={field.name}
                    value={user[field.name]}
                    onChange={field.editable ? handleChange : undefined}
                    onFocus={() => field.editable && setActiveField(field.name)}
                    onBlur={() => setActiveField(null)}
                    disabled={!field.editable}
                    placeholder={field.placeholder}
                    style={{
                      ...styles.input,
                      ...(field.editable ? {} : styles.inputDisabled)
                    }}
                  />
                  {!field.editable && (
                    <span style={styles.lockIcon}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Bio */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Bio</label>
              <div style={{
                ...styles.inputWrap,
                ...(activeField === "bio" ? styles.inputWrapActive : {})
              }}>
                <textarea
                  name="bio"
                  value={user.bio}
                  onChange={handleChange}
                  onFocus={() => setActiveField("bio")}
                  onBlur={() => setActiveField(null)}
                  placeholder="Tell the world a little about yourself..."
                  rows={3}
                  style={{ ...styles.input, ...styles.textarea }}
                />
                <span style={styles.charCount}>{user.bio?.length || 0} chars</span>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleUpdate}
              disabled={saving}
              style={styles.saveBtn}
              className="save-btn"
            >
              {saving ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={styles.spinnerSm} /> Saving...
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save Changes
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 16px",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden"
  },
  blob1: {
    position: "fixed", top: "-200px", right: "-200px",
    width: 600, height: 600, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
    pointerEvents: "none"
  },
  blob2: {
    position: "fixed", bottom: "-200px", left: "-200px",
    width: 500, height: 500, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
    pointerEvents: "none"
  },
  card: {
    width: "100%", maxWidth: 480,
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 24,
    padding: "40px 36px",
    position: "relative",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)"
  },
  cardHeader: {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 32
  },
  headerLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
    color: "rgba(99,102,241,0.8)", textTransform: "uppercase"
  },
  headerDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#6366f1",
    boxShadow: "0 0 8px #6366f1",
    marginLeft: "auto",
    animation: "pulse 2s infinite"
  },
  avatarSection: {
    display: "flex", flexDirection: "column",
    alignItems: "center", marginBottom: 32
  },
  avatarRing: {
    position: "relative", marginBottom: 16,
    padding: 3,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #10b981)",
  },
  avatarWrap: {
    position: "relative", width: 100, height: 100,
    borderRadius: "50%", overflow: "hidden",
    border: "3px solid #020617"
  },
  avatar: {
    width: "100%", height: "100%", objectFit: "cover"
  },
  uploadOverlay: {
    position: "absolute", inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "50%"
  },
  cameraBtn: {
    position: "absolute", bottom: 2, right: 2,
    width: 30, height: 30, borderRadius: "50%",
    background: "#6366f1", border: "2px solid #020617",
    color: "#fff", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "transform 0.2s, background 0.2s"
  },
  userName: {
    color: "#f1f5f9", fontSize: 20, fontWeight: 700,
    margin: "0 0 4px", letterSpacing: "-0.02em"
  },
  userRole: {
    fontSize: 11, fontWeight: 600, letterSpacing: "0.15em",
    color: "#10b981", textTransform: "uppercase",
    background: "rgba(16,185,129,0.1)",
    padding: "3px 12px", borderRadius: 20,
    border: "1px solid rgba(16,185,129,0.2)"
  },
  toast: {
    padding: "10px 16px", borderRadius: 10,
    border: "1px solid",
    fontSize: 13, fontWeight: 500,
    marginBottom: 24, textAlign: "center"
  },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
    color: "rgba(148,163,184,0.8)", textTransform: "uppercase"
  },
  inputWrap: {
    position: "relative",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12, transition: "border-color 0.2s, box-shadow 0.2s"
  },
  inputWrapActive: {
    borderColor: "rgba(99,102,241,0.6)",
    boxShadow: "0 0 0 3px rgba(99,102,241,0.1)"
  },
  inputWrapDisabled: {
    background: "rgba(255,255,255,0.01)",
    borderColor: "rgba(255,255,255,0.04)"
  },
  input: {
    width: "100%", padding: "12px 16px",
    background: "transparent", border: "none", outline: "none",
    color: "#e2e8f0", fontSize: 14, fontWeight: 400,
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box"
  },
  inputDisabled: { color: "rgba(148,163,184,0.5)", cursor: "not-allowed" },
  textarea: { resize: "none", lineHeight: 1.6 },
  lockIcon: {
    position: "absolute", right: 14, top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(148,163,184,0.3)"
  },
  charCount: {
    position: "absolute", bottom: 10, right: 14,
    fontSize: 10, color: "rgba(148,163,184,0.3)", fontWeight: 500
  },
  saveBtn: {
    marginTop: 8, padding: "14px",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    border: "none", borderRadius: 12, color: "#fff",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "opacity 0.2s, transform 0.15s",
    boxShadow: "0 4px 20px rgba(99,102,241,0.4)"
  },
  loadingWrap: {
    minHeight: "100vh", background: "#020617",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 16
  },
  loadingText: { color: "rgba(148,163,184,0.6)", fontSize: 14 },
  spinner: {
    width: 36, height: 36, borderRadius: "50%",
    border: "3px solid rgba(99,102,241,0.2)",
    borderTopColor: "#6366f1", animation: "spin 0.8s linear infinite"
  },
  spinnerSm: {
    width: 16, height: 16, borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff", animation: "spin 0.8s linear infinite",
    display: "inline-block"
  }
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes toast-in { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  .toast-in { animation: toast-in 0.3s ease; }
  .camera-btn:hover { transform: scale(1.15) !important; background: #4f46e5 !important; }
  .save-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .avatar-ring { cursor: pointer; }
`;