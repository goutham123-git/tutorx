import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutTeacher } from "../services/teacherAPI";

const BASE_URL = "http://localhost:5000";
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/uploads/${path}`;
};

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  overview:  "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  rooms:     "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9",
  analysis:  "M18 20V10 M12 20V4 M6 20v-6",
  earnings:  "M12 2v20 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  courses:   "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  collab:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  ai:        "M12 2a10 10 0 110 20A10 10 0 0112 2z M12 8v4l3 3",
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  bell:      "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  plus:      "M12 5v14 M5 12h14",
  chevronR:  "M9 18l6-6-6-6",
  chevronL:  "M15 18l-6-6 6-6",
  user:      "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  logout:    "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  verified:  "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
  search:    "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  send:      "M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
  check:     "M20 6L9 17l-5-5",
  close:     "M18 6L6 18 M6 6l12 12",
  clock:     "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  users2:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z",
};

const navItems = [
  { key: "overview",  label: "Overview",        icon: "overview",  section: "main"    },
  { key: "rooms",     label: "My Rooms",         icon: "rooms",     section: "main"    },
  { key: "analysis",  label: "Student Analysis", icon: "analysis",  section: "main"    },
  { key: "earnings",  label: "Earnings",         icon: "earnings",  section: "main"    },
  { key: "courses",   label: "My Courses",       icon: "courses",   section: "content" },
  { key: "collab",    label: "Collaboration",    icon: "collab",    section: "content" },
  { key: "ai",        label: "AI Tutor",         icon: "ai",        section: "content" },
  { key: "settings",  label: "Settings",         icon: "settings",  section: "system"  },
];

// ── Avatar helper ─────────────────────────────────────────────────────────────
function Avatar({ pic, name, size = 44 }) {
  const initials = name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "T";
  const url = getImageUrl(pic);
  return (
    <div style={{
      width: size, height: size, minWidth: size, borderRadius: "50%",
      background: "#9FE1CB", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.3, fontWeight: 700, color: "#0F6E56",
    }}>
      {url
        ? <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.style.display = "none"; }}/>
        : initials}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ collapsed, setCollapsed, teacher, profilePic, isVerified,
  profileMenu, setProfileMenu, navigate, handleLogout }) {
  const sections = [...new Set(navItems.map(n => n.section))];
  const initials = teacher?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "T";

  return (
    <aside style={{
      width: collapsed ? 60 : 232, minWidth: collapsed ? 60 : 232,
      background: "#fff", borderRight: "0.5px solid #e8e8e5",
      display: "flex", flexDirection: "column",
      transition: "width 0.22s ease, min-width 0.22s ease",
      overflow: "hidden", position: "relative", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        height: 56, display: "flex", alignItems: "center",
        padding: collapsed ? "0 14px" : "0 16px",
        borderBottom: "0.5px solid #e8e8e5",
        gap: 10, justifyContent: collapsed ? "center" : "flex-start",
      }}>
        <div style={{ width: 30, height: 30, minWidth: 30, background: "#1D9E75",
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white"/>
          </svg>
        </div>
        {!collapsed && <>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a",
            fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap" }}>TUTORX</span>
          <button onClick={() => setCollapsed(true)} style={{
            marginLeft: "auto", background: "none", border: "0.5px solid #e8e8e5",
            borderRadius: 6, width: 26, height: 26, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa",
          }}><Icon d={icons.chevronL} size={14}/></button>
        </>}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{
            position: "absolute", left: 44, top: 17,
            background: "#fff", border: "0.5px solid #e8e8e5",
            borderRadius: 6, width: 22, height: 22, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", zIndex: 10,
          }}><Icon d={icons.chevronR} size={12}/></button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden" }}>
        {sections.map(section => (
          <div key={section}>
            {!collapsed && (
              <p style={{ fontSize: 10, color: "#ccc", textTransform: "uppercase",
                letterSpacing: "0.08em", padding: "12px 8px 4px", whiteSpace: "nowrap" }}>
                {section}
              </p>
            )}
            {navItems.filter(n => n.section === section).map(item => (
              <button key={item.key}
                onClick={() => {
                  if (item.key === "collab") return; // already here
                  navigate("/teacher-dashboard");
                }}
                style={{
                  display: "flex", alignItems: "center",
                  gap: collapsed ? 0 : 10,
                  padding: collapsed ? "10px 0" : "9px 10px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  width: "100%", borderRadius: 8, border: "none", cursor: "pointer",
                  background: item.key === "collab" ? "#E1F5EE" : "transparent",
                  color: item.key === "collab" ? "#0F6E56" : "#999",
                  fontWeight: item.key === "collab" ? 600 : 400,
                  fontSize: 13, whiteSpace: "nowrap", marginBottom: 1,
                  transition: "all 0.13s", fontFamily: "'DM Sans',sans-serif",
                }}
                onMouseEnter={e => { if (item.key !== "collab") { e.currentTarget.style.background="#f7f7f5"; e.currentTarget.style.color="#555"; }}}
                onMouseLeave={e => { if (item.key !== "collab") { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#999"; }}}
              >
                <Icon d={icons[item.icon]} size={16}/>
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "10px 8px", borderTop: "0.5px solid #e8e8e5", position: "relative" }}>
        <div onClick={e => { e.stopPropagation(); setProfileMenu(v => !v); }} style={{
          display: "flex", alignItems: "center",
          gap: collapsed ? 0 : 10,
          padding: collapsed ? "8px 0" : "8px 10px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: 8, cursor: "pointer", transition: "background 0.13s",
        }}
          onMouseEnter={e => e.currentTarget.style.background="#f7f7f5"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
        >
          <Avatar pic={teacher?.profile_pic} name={teacher?.name} size={32}/>
          {!collapsed && (
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {teacher?.name || "Teacher"}
                </p>
                {isVerified && <span style={{ color: "#1D9E75" }}><Icon d={icons.verified} size={12}/></span>}
              </div>
              <p style={{ fontSize: 11, color: "#bbb" }}>Teacher</p>
            </div>
          )}
        </div>

        {profileMenu && (
          <div onClick={e => e.stopPropagation()} style={{
            position: "absolute", bottom: collapsed ? 8 : 62, left: collapsed ? 64 : 12,
            width: 188, background: "#fff", border: "0.5px solid #e8e8e5",
            borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.10)", zIndex: 50, overflow: "hidden",
          }}>
            <button onClick={() => navigate("/teacher-profile")} style={{
              width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "#1a1a1a", fontFamily: "'DM Sans',sans-serif",
            }}
              onMouseEnter={e => e.currentTarget.style.background="#f7f7f5"}
              onMouseLeave={e => e.currentTarget.style.background="none"}
            >
              <Icon d={icons.user} size={14}/> View Profile
            </button>
            <div style={{ height: "0.5px", background: "#f0f0ee" }}/>
            <button onClick={handleLogout} style={{
              width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "#D85A30", fontFamily: "'DM Sans',sans-serif",
            }}
              onMouseEnter={e => e.currentTarget.style.background="#FAECE7"}
              onMouseLeave={e => e.currentTarget.style.background="none"}
            >
              <Icon d={icons.logout} size={14}/> Log Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Teacher Card ──────────────────────────────────────────────────────────────
function TeacherCard({ teacher, onSendRequest, requestStatus }) {
  const subjects = teacher.subjects ? teacher.subjects.split(",").map(s => s.trim()) : [];
  const statusMap = {
    pending:  { label: "Request Sent",  bg: "#FAEEDA", color: "#854F0B", icon: icons.clock },
    accepted: { label: "Collaborating", bg: "#E1F5EE", color: "#0F6E56", icon: icons.check },
    rejected: { label: "Declined",      bg: "#FAECE7", color: "#993C1D", icon: icons.close },
  };
  const st = statusMap[requestStatus];

  return (
    <div style={{
      background: "#fff", border: "0.5px solid #e8e8e5",
      borderRadius: 14, padding: "18px", transition: "box-shadow 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.07)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow="none"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Avatar pic={teacher.profile_pic} name={teacher.name} size={46}/>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a",
              fontFamily: "'Outfit',sans-serif",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {teacher.name}
            </p>
            {teacher.is_verified === 1 && (
              <span style={{ color: "#1D9E75", flexShrink: 0 }}><Icon d={icons.verified} size={13}/></span>
            )}
          </div>
          <p style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>
            {teacher.experience_years ? `${teacher.experience_years} yrs exp` : "Teacher"}
            {teacher.institution_name ? ` · ${teacher.institution_name}` : ""}
          </p>
        </div>
      </div>

      {/* Subjects */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12, minHeight: 26 }}>
        {subjects.slice(0, 4).map(s => (
          <span key={s} style={{
            fontSize: 11, padding: "3px 8px", borderRadius: 20,
            background: "#E1F5EE", color: "#0F6E56", fontWeight: 500,
          }}>{s}</span>
        ))}
        {subjects.length > 4 && (
          <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20,
            background: "#f5f5f3", color: "#aaa", fontWeight: 500 }}>
            +{subjects.length - 4}
          </span>
        )}
        {subjects.length === 0 && <span style={{ fontSize: 11, color: "#ccc" }}>No subjects listed</span>}
      </div>

      {/* Bio */}
      {teacher.bio && (
        <p style={{
          fontSize: 12, color: "#888", lineHeight: 1.55, marginBottom: 12,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{teacher.bio}</p>
      )}

      {/* Action button */}
      {st ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 12px", borderRadius: 8,
          background: st.bg, justifyContent: "center",
        }}>
          <Icon d={st.icon} size={13}/>
          <span style={{ fontSize: 12, fontWeight: 600, color: st.color }}>{st.label}</span>
        </div>
      ) : (
        <button onClick={() => onSendRequest(teacher.user_id)} style={{
          width: "100%", padding: "8px",
          background: "#1D9E75", color: "#fff",
          border: "none", borderRadius: 8,
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "background 0.13s",
        }}
          onMouseEnter={e => e.currentTarget.style.background="#0F6E56"}
          onMouseLeave={e => e.currentTarget.style.background="#1D9E75"}
        >
          <Icon d={icons.send} size={13}/> Send Request
        </button>
      )}
    </div>
  );
}

// ── Notification Bell ─────────────────────────────────────────────────────────
function NotificationBell({ requests, onAccept, onReject }) {
  const [open, setOpen] = useState(false);
  const pending = requests.filter(r => r.status === "pending");

  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={e => { e.stopPropagation(); setOpen(v => !v); }} style={{
        position: "relative", width: 34, height: 34, borderRadius: 8,
        border: "0.5px solid #e8e8e5", background: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa",
      }}>
        <Icon d={icons.bell} size={16}/>
        {pending.length > 0 && (
          <span style={{
            position: "absolute", top: 5, right: 5,
            width: 16, height: 16, borderRadius: "50%",
            background: "#D85A30", color: "#fff",
            fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{pending.length}</span>
        )}
      </button>

      {open && (
        <div onClick={e => e.stopPropagation()} style={{
          position: "absolute", top: 42, right: 0,
          width: 320, background: "#fff",
          border: "0.5px solid #e8e8e5", borderRadius: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden",
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "0.5px solid #f0f0ee",
            display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a",
              fontFamily: "'Outfit',sans-serif" }}>Collaboration Requests</p>
            {pending.length > 0 && (
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20,
                background: "#FAECE7", color: "#D85A30", fontWeight: 600 }}>
                {pending.length} pending
              </span>
            )}
          </div>

          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {requests.length === 0 ? (
              <p style={{ fontSize: 13, color: "#bbb", padding: "20px 16px", textAlign: "center" }}>
                No requests yet
              </p>
            ) : (
              requests.map(req => (
                <div key={req.id} style={{ padding: "12px 16px", borderBottom: "0.5px solid #f7f7f5" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Avatar pic={req.sender?.profile_pic} name={req.sender?.name} size={34}/>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{req.sender?.name}</p>
                      <p style={{ fontSize: 11, color: "#bbb" }}>
                        {req.sender?.subjects?.split(",").slice(0, 2).join(", ")}
                      </p>
                    </div>
                    {req.status === "accepted" && (
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20,
                        background: "#E1F5EE", color: "#0F6E56", fontWeight: 600 }}>Accepted</span>
                    )}
                    {req.status === "rejected" && (
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20,
                        background: "#FAECE7", color: "#D85A30", fontWeight: 600 }}>Declined</span>
                    )}
                  </div>
                  {req.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => onAccept(req.id)} style={{
                        flex: 1, padding: "6px", background: "#1D9E75", color: "#fff",
                        border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600,
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 5,
                      }}><Icon d={icons.check} size={12}/> Accept</button>
                      <button onClick={() => onReject(req.id)} style={{
                        flex: 1, padding: "6px", background: "#f5f5f3", color: "#777",
                        border: "0.5px solid #e8e8e5", borderRadius: 7, fontSize: 12,
                        fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      }}><Icon d={icons.close} size={12}/> Decline</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Partner card (accepted) ───────────────────────────────────────────────────
function PartnerCard({ collab, myUserId }) {
  const partner = String(collab.sender_id) === String(myUserId) ? collab.receiver : collab.sender;
  const subjects = partner?.subjects ? partner.subjects.split(",").map(s => s.trim()) : [];

  return (
    <div style={{
      background: "#fff", border: "0.5px solid #1D9E75",
      borderRadius: 14, padding: "16px 18px",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <Avatar pic={partner?.profile_pic} name={partner?.name} size={44}/>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a",
            fontFamily: "'Outfit',sans-serif" }}>{partner?.name}</p>
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20,
            background: "#E1F5EE", color: "#0F6E56", fontWeight: 600 }}>Collaborating</span>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {subjects.slice(0, 3).map(s => (
            <span key={s} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20,
              background: "#f5f5f3", color: "#888" }}>{s}</span>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 11, color: "#ccc", flexShrink: 0 }}>
        Since {new Date(collab.accepted_at || collab.created_at)
          .toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CollaborationPage() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  // Decode user id from JWT (without a library)
  const myUserId = (() => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch { return null; }
  })();

  const [collapsed,   setCollapsed]   = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [teacher,     setTeacher]     = useState(null);
  const [isVerified,  setIsVerified]  = useState(false);

  const [allTeachers,  setAllTeachers]  = useState([]);
  const [collabs,      setCollabs]      = useState([]);
  const [incomingReqs, setIncomingReqs] = useState([]);
  const [sentStatuses, setSentStatuses] = useState({}); // { user_id: "pending"|"accepted"|"rejected" }

  const [searchQuery,   setSearchQuery]   = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [tab,           setTab]           = useState("discover");
  const [toast,         setToast]         = useState("");
  const [loading,       setLoading]       = useState(true);

  const authHeader = { Authorization: `Bearer ${token}` };
  const jsonHeader = { "Content-Type": "application/json", ...authHeader };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchAll = async () => {
    try {
      // Own profile
      const pRes  = await fetch(`${BASE_URL}/api/teacher/profile`, { headers: authHeader });
      const pData = await pRes.json();
      if (pData.name) {
        setTeacher(pData);
        setIsVerified(pData.is_verified || false);
      }

      // All other teachers
      const tRes  = await fetch(`${BASE_URL}/api/collaboration/teachers`, { headers: authHeader });
      const tData = await tRes.json();
      setAllTeachers(tData.teachers || []);

      // Sent request statuses
      const sRes  = await fetch(`${BASE_URL}/api/collaboration/sent`, { headers: authHeader });
      const sData = await sRes.json();
      const map   = {};
      (sData.requests || []).forEach(r => { map[r.receiver_id] = r.status; });
      setSentStatuses(map);

      // Incoming requests
      const iRes  = await fetch(`${BASE_URL}/api/collaboration/incoming`, { headers: authHeader });
      const iData = await iRes.json();
      setIncomingReqs(iData.requests || []);

      // Accepted collaborations
      const cRes  = await fetch(`${BASE_URL}/api/collaboration/partners`, { headers: authHeader });
      const cData = await cRes.json();
      setCollabs(cData.collaborations || []);
    } catch (err) {
      console.error("Collab load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const close = () => setProfileMenu(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleSendRequest = async (receiverUserId) => {
    try {
      const res  = await fetch(`${BASE_URL}/api/collaboration/request`, {
        method: "POST", headers: jsonHeader,
        body: JSON.stringify({ receiverId: receiverUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSentStatuses(s => ({ ...s, [receiverUserId]: "pending" }));
        showToast("Collaboration request sent!");
      } else {
        showToast(data.message || "Failed to send request.");
      }
    } catch { showToast("Network error. Please try again."); }
  };

  const handleAccept = async (requestId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/collaboration/respond`, {
        method: "PUT", headers: jsonHeader,
        body: JSON.stringify({ requestId, action: "accept" }),
      });
      if (res.ok) {
        setIncomingReqs(r => r.map(x => x.id === requestId ? { ...x, status: "accepted" } : x));
        showToast("Collaboration accepted!");
        await fetchAll(); // refresh partners list
      }
    } catch { showToast("Network error."); }
  };

  const handleReject = async (requestId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/collaboration/respond`, {
        method: "PUT", headers: jsonHeader,
        body: JSON.stringify({ requestId, action: "reject" }),
      });
      if (res.ok) {
        setIncomingReqs(r => r.map(x => x.id === requestId ? { ...x, status: "rejected" } : x));
        showToast("Request declined.");
      }
    } catch { showToast("Network error."); }
  };

  const handleLogout = () => { logoutTeacher(); navigate("/login"); };

  // Filter teachers for discover tab
  const allSubjects = [...new Set(
    allTeachers.flatMap(t => t.subjects ? t.subjects.split(",").map(s => s.trim()) : [])
  )].sort();

  const filteredTeachers = allTeachers.filter(t => {
    const matchSearch  = !searchQuery ||
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjects?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = filterSubject === "all" || t.subjects?.includes(filterSubject);
    return matchSearch && matchSubject;
  });

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden",
      fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#f7f7f5" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#e0e0dc;border-radius:4px;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 200,
          background: "#1D9E75", color: "#fff",
          padding: "10px 18px", borderRadius: 10,
          fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 20px rgba(29,158,117,0.25)",
        }}>
          <Icon d={icons.check} size={14}/> {toast}
        </div>
      )}

      <Sidebar
        collapsed={collapsed} setCollapsed={setCollapsed}
        teacher={teacher} isVerified={isVerified}
        profileMenu={profileMenu} setProfileMenu={setProfileMenu}
        navigate={navigate} handleLogout={handleLogout}
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <header style={{
          height: 56, background: "#fff", borderBottom: "0.5px solid #e8e8e5",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", flexShrink: 0,
        }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a",
            fontFamily: "'Outfit',sans-serif" }}>Collaboration</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <NotificationBell
              requests={incomingReqs}
              onAccept={handleAccept}
              onReject={handleReject}
            />
            <button onClick={() => navigate("/teacher-profile")} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "5px 12px 5px 6px",
              background: "#f5f5f3", border: "0.5px solid #e8e8e5",
              borderRadius: 20, cursor: "pointer", transition: "background 0.13s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="#eeeeed"}
              onMouseLeave={e => e.currentTarget.style.background="#f5f5f3"}
            >
              <Avatar pic={teacher?.profile_pic} name={teacher?.name} size={26}/>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>
                {teacher?.name?.split(" ")[0] || "Profile"}
              </span>
              {isVerified && <span style={{ color: "#1D9E75" }}><Icon d={icons.verified} size={13}/></span>}
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a",
              fontFamily: "'Outfit',sans-serif" }}>Collaborate with Teachers</h2>
            <p style={{ fontSize: 13, color: "#bbb", marginTop: 3 }}>
              Find and connect with other teachers to grow your reach together.
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 22 }}>
            {[
              { label: "Teachers on Platform", value: allTeachers.length,  color: "#1D9E75", bg: "#E1F5EE" },
              { label: "Your Collaborations",  value: collabs.length,       color: "#185FA5", bg: "#E6F1FB" },
              { label: "Pending Requests",     value: incomingReqs.filter(r => r.status === "pending").length, color: "#D85A30", bg: "#FAECE7" },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", border: "0.5px solid #e8e8e5",
                borderRadius: 12, padding: "16px 18px" }}>
                <p style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: s.color,
                  fontFamily: "'Outfit',sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 18,
            background: "#f5f5f3", borderRadius: 10, padding: 4, width: "fit-content" }}>
            {[
              { key: "discover", label: "Discover Teachers" },
              { key: "partners", label: `My Collaborations (${collabs.length})` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                background: tab === t.key ? "#fff" : "transparent",
                color: tab === t.key ? "#1a1a1a" : "#aaa",
                fontWeight: tab === t.key ? 600 : 400,
                fontSize: 13, fontFamily: "'DM Sans',sans-serif",
                boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.13s",
              }}>{t.label}</button>
            ))}
          </div>

          {/* Discover tab */}
          {tab === "discover" && (
            <>
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <span style={{ position: "absolute", left: 11, top: "50%",
                    transform: "translateY(-50%)", color: "#ccc" }}>
                    <Icon d={icons.search} size={14}/>
                  </span>
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name or subject..."
                    style={{
                      width: "100%", padding: "9px 12px 9px 34px",
                      border: "0.5px solid #e8e8e5", borderRadius: 9,
                      fontSize: 13, color: "#1a1a1a", background: "#fff",
                      outline: "none", fontFamily: "'DM Sans',sans-serif",
                    }}
                  />
                </div>
                <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                  style={{
                    padding: "9px 12px", border: "0.5px solid #e8e8e5",
                    borderRadius: 9, fontSize: 13, color: "#555",
                    background: "#fff", outline: "none",
                    fontFamily: "'DM Sans',sans-serif", cursor: "pointer", minWidth: 160,
                  }}>
                  <option value="all">All Subjects</option>
                  {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%",
                    border: "3px solid #E1F5EE", borderTop: "3px solid #1D9E75",
                    animation: "spin 0.7s linear infinite" }}/>
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#bbb" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No teachers found</p>
                  <p style={{ fontSize: 13 }}>Try a different search or filter</p>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 14,
                }}>
                  {filteredTeachers.map(t => (
                    <TeacherCard
                      key={t.id}
                      teacher={t}
                      onSendRequest={handleSendRequest}
                      requestStatus={sentStatuses[t.user_id] || null}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Partners tab */}
          {tab === "partners" && (
            collabs.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "48px 0",
                background: "#fff", borderRadius: 14, border: "0.5px solid #e8e8e5",
              }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%",
                  background: "#E1F5EE", display: "flex", alignItems: "center",
                  justifyContent: "center", margin: "0 auto 12px", color: "#1D9E75" }}>
                  <Icon d={icons.users2} size={22}/>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a",
                  fontFamily: "'Outfit',sans-serif", marginBottom: 6 }}>No collaborations yet</p>
                <p style={{ fontSize: 13, color: "#bbb", marginBottom: 16 }}>
                  Discover teachers and send a request to start collaborating.
                </p>
                <button onClick={() => setTab("discover")} style={{
                  padding: "8px 18px", background: "#1D9E75", color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>Discover Teachers</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {collabs.map(c => (
                  <PartnerCard key={c.id} collab={c} myUserId={myUserId}/>
                ))}
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}