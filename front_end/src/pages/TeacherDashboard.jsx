  import { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import { getTeacherProfile, logoutTeacher } from "../services/teacherAPI";

  const BASE_URL = "http://localhost:5000";

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}${path}`;
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

  const earningsData = [
    { month: "Oct", amount: 8200  },
    { month: "Nov", amount: 11400 },
    { month: "Dec", amount: 9800  },
    { month: "Jan", amount: 13200 },
    { month: "Feb", amount: 15600 },
    { month: "Mar", amount: 18400 },
  ];
  const maxEarning = Math.max(...earningsData.map(e => e.amount));

  const rooms = [
    { id: 1, name: "Mathematics – Grade 10", students: 34, type: "paid",  color: "#1D9E75", pending: 8 },
    { id: 2, name: "Physics Fundamentals",   students: 28, type: "free",  color: "#185FA5", pending: 3 },
    { id: 3, name: "Organic Chemistry",      students: 21, type: "paid",  color: "#D85A30", pending: 5 },
    { id: 4, name: "English Literature",     students: 19, type: "free",  color: "#8B5CF6", pending: 0 },
  ];

  const activity = [
    { text: "Riya S. submitted Assignment 3 in Maths",      time: "2 min ago",  color: "#1D9E75", bg: "#E1F5EE" },
    { text: "Arjun K. joined Physics Fundamentals",         time: "18 min ago", color: "#185FA5", bg: "#E6F1FB" },
    { text: "Quiz 2 completed by 14 students in Chemistry", time: "1 hr ago",   color: "#D85A30", bg: "#FAECE7" },
    { text: "Meera P. submitted Assignment 2 in English",   time: "2 hr ago",   color: "#1D9E75", bg: "#E1F5EE" },
    { text: "5 new students joined Organic Chemistry",      time: "3 hr ago",   color: "#8B5CF6", bg: "#F3EFFE" },
  ];

  function StatCard({ label, value, change, up }) {
    return (
      <div style={{ background: "#f5f5f3", borderRadius: 10, padding: "14px 16px" }}>
        <p style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>{label}</p>
        <p style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Outfit',sans-serif" }}>{value}</p>
        {change && (
          <p style={{ fontSize: 11, marginTop: 4, color: up ? "#0F6E56" : "#993C1D", fontWeight: 500 }}>
            {up ? "↑" : "↓"} {change}
          </p>
        )}
      </div>
    );
  }

  export default function TeacherDashboard() {
    const navigate = useNavigate();
    const [collapsed,   setCollapsed]   = useState(false);
    const [active,      setActive]      = useState("overview");
    const [profileMenu, setProfileMenu] = useState(false);
    const [teacher,     setTeacher]     = useState(null);
    const [profilePic,  setProfilePic]  = useState(null);
    const [isVerified,  setIsVerified]  = useState(false);

    useEffect(() => {
      const load = async () => {
        try {
          const data = await getTeacherProfile();
          setTeacher(data);
          setProfilePic(getImageUrl(data.profile_pic));
          setIsVerified(data.is_verified || false);
        } catch {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          setTeacher(user);
        }
      };
      load();
      const close = () => setProfileMenu(false);
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }, []);

    const handleLogout = () => { logoutTeacher(); navigate("/login"); };

    const initials = teacher?.name
      ? teacher.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
      : "T";

    const lastLogin = teacher?.last_login
      ? new Date(teacher.last_login).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : new Date().toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    const sections = [...new Set(navItems.map(n => n.section))];

    return (
      <div style={{ display: "flex", height: "100vh", overflow: "hidden",
        fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#f7f7f5" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=DM+Sans:wght@400;500;600&display=swap');
          *{box-sizing:border-box;margin:0;padding:0;}
          ::-webkit-scrollbar{width:4px;}
          ::-webkit-scrollbar-thumb{background:#e0e0dc;border-radius:4px;}
        `}</style>

        {/* Sidebar */}
        <aside style={{
          width: collapsed ? 60 : 232, minWidth: collapsed ? 60 : 232,
          background: "#fff", borderRight: "0.5px solid #e8e8e5",
          display: "flex", flexDirection: "column",
          transition: "width 0.22s ease, min-width 0.22s ease",
          overflow: "hidden", position: "relative", flexShrink: 0,
        }}>
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
                  <button key={item.key} onClick={() => {
  setActive(item.key);
  if (item.key === "collab") navigate("/teacher-collaboration");
}} style={{
                    display: "flex", alignItems: "center",
                    gap: collapsed ? 0 : 10,
                    padding: collapsed ? "10px 0" : "9px 10px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    width: "100%", borderRadius: 8, border: "none", cursor: "pointer",
                    background: active === item.key ? "#E1F5EE" : "transparent",
                    color: active === item.key ? "#0F6E56" : "#999",
                    fontWeight: active === item.key ? 600 : 400,
                    fontSize: 13, whiteSpace: "nowrap", marginBottom: 1,
                    transition: "all 0.13s", fontFamily: "'DM Sans',sans-serif",
                  }}
                    onMouseEnter={e => { if (active !== item.key) { e.currentTarget.style.background="#f7f7f5"; e.currentTarget.style.color="#555"; }}}
                    onMouseLeave={e => { if (active !== item.key) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#999"; }}}
                  >
                    <Icon d={icons[item.icon]} size={16}/>
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>

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
              <div style={{
                width: 32, height: 32, minWidth: 32, borderRadius: "50%",
                background: "#9FE1CB", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#0F6E56",
              }}>
                {profilePic
                  ? <img src={profilePic} alt="av" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                  : initials}
              </div>
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
                position: "absolute",
                bottom: collapsed ? 8 : 62,
                left: collapsed ? 64 : 12,
                width: 188,
                background: "#fff", border: "0.5px solid #e8e8e5",
                borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
                zIndex: 50, overflow: "hidden",
              }}>
                <button onClick={() => navigate("/teacher-profile")} style={{
                  width: "100%", padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 8,
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
                  width: "100%", padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 8,
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

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <header style={{
            height: 56, background: "#fff", borderBottom: "0.5px solid #e8e8e5",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px", flexShrink: 0,
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Outfit',sans-serif" }}>
              {navItems.find(n => n.key === active)?.label || "Overview"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <p style={{ fontSize: 12, color: "#bbb" }}>
                Last login: <span style={{ color: "#777", fontWeight: 500 }}>{lastLogin}</span>
              </p>
              <button style={{
                position: "relative", width: 34, height: 34, borderRadius: 8,
                border: "0.5px solid #e8e8e5", background: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa",
              }}>
                <Icon d={icons.bell} size={16}/>
                <span style={{ position: "absolute", top: 7, right: 7,
                  width: 6, height: 6, borderRadius: "50%", background: "#D85A30" }}/>
              </button>
              <button onClick={() => navigate("/teacher-profile")} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 12px 5px 6px",
                background: "#f5f5f3", border: "0.5px solid #e8e8e5",
                borderRadius: 20, cursor: "pointer", transition: "background 0.13s",
              }}
                onMouseEnter={e => e.currentTarget.style.background="#eeeeed"}
                onMouseLeave={e => e.currentTarget.style.background="#f5f5f3"}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", background: "#9FE1CB",
                  overflow: "hidden", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0F6E56",
                }}>
                  {profilePic
                    ? <img src={profilePic} alt="av" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                    : initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>
                  {teacher?.name?.split(" ")[0] || "Profile"}
                </span>
                {isVerified && <span style={{ color: "#1D9E75" }}><Icon d={icons.verified} size={13}/></span>}
              </button>
              <button style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 16px", background: "#1D9E75",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.13s",
              }}
                onMouseEnter={e => e.currentTarget.style.background="#0F6E56"}
                onMouseLeave={e => e.currentTarget.style.background="#1D9E75"}
              >
                <Icon d={icons.plus} size={14}/> Create Room
              </button>
            </div>
          </header>

          <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: 21, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Outfit',sans-serif" }}>
                Good morning, {teacher?.name?.split(" ")[0] || "Teacher"} 👋
              </h2>
              <p style={{ fontSize: 13, color: "#bbb", marginTop: 3 }}>
                Here's what's happening in your classrooms today.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
              <StatCard label="Total Students"     value="102"     change="12 this week" up/>
              <StatCard label="Active Rooms"        value="4"       change="1 new"        up/>
              <StatCard label="Pending Submissions" value="16"      change="8 today"/>
              <StatCard label="This Month Earnings" value="₹18,400" change="18% vs last"  up/>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ background: "#fff", border: "0.5px solid #e8e8e5", borderRadius: 14, padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Outfit',sans-serif" }}>My Rooms</p>
                  <button style={{ fontSize: 12, color: "#1D9E75", border: "none", background: "none", cursor: "pointer", fontWeight: 600 }}>View all</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {rooms.map(room => (
                    <div key={room.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", borderRadius: 10,
                      border: "0.5px solid #f0f0ee", cursor: "pointer", transition: "box-shadow 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow="0 2px 14px rgba(0,0,0,0.07)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow="none"}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 9,
                        background: room.color+"22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: room.color }}/>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{room.name}</p>
                        <p style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>{room.students} students</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                        <span style={{
                          fontSize: 11, padding: "2px 9px", borderRadius: 20, fontWeight: 600,
                          background: room.type === "paid" ? "#FAEEDA" : "#E1F5EE",
                          color:      room.type === "paid" ? "#854F0B" : "#0F6E56",
                        }}>{room.type}</span>
                        {room.pending > 0 && (
                          <span style={{ fontSize: 11, color: "#D85A30", fontWeight: 500 }}>{room.pending} pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#fff", border: "0.5px solid #e8e8e5", borderRadius: 14, padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Outfit',sans-serif" }}>Recent Activity</p>
                  <button style={{ fontSize: 12, color: "#1D9E75", border: "none", background: "none", cursor: "pointer", fontWeight: 600 }}>See all</button>
                </div>
                {activity.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, padding: "10px 0",
                    borderBottom: i < activity.length - 1 ? "0.5px solid #f5f5f3" : "none",
                  }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }}/>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, color: "#333", lineHeight: 1.45 }}>{item.text}</p>
                      <p style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", border: "0.5px solid #e8e8e5", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Outfit',sans-serif" }}>Earnings Overview</p>
                  <p style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>Last 6 months</p>
                </div>
                <span style={{ background: "#E1F5EE", color: "#0F6E56",
                  fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8 }}>
                  ↑ 18% this month
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 110 }}>
                {earningsData.map((e, i) => {
                  const h = Math.round((e.amount / maxEarning) * 88);
                  const cur = i === earningsData.length - 1;
                  return (
                    <div key={e.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <p style={{ fontSize: 10, color: cur ? "#0F6E56" : "#bbb", fontWeight: cur ? 700 : 400 }}>
                        ₹{(e.amount/1000).toFixed(1)}k
                      </p>
                      <div style={{
                        width: "100%", height: h, background: cur ? "#1D9E75" : "#C5EBD9",
                        borderRadius: "5px 5px 0 0", cursor: "pointer", transition: "background 0.15s",
                      }}
                        onMouseEnter={ev => ev.currentTarget.style.background="#1D9E75"}
                        onMouseLeave={ev => { if (!cur) ev.currentTarget.style.background="#C5EBD9"; }}
                      />
                      <p style={{ fontSize: 11, color: "#bbb" }}>{e.month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }