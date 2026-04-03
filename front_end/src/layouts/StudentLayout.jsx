import { useState, useEffect } from "react";
import {
  Bell, Search, LayoutDashboard, UserCircle,
  BookOpen, Calendar, Settings, ChevronRight, Sparkles, Clock,
  Award, TrendingUp, Star,
} from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// ─── Nav items ───────────────────────────────────────────────────────────────
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",  path: "/student-dashboard"          },
  { icon: UserCircle,      label: "Profile",     path: "/student-dashboard/profile"  },
  { icon: BookOpen,        label: "My Courses",  path: "/student-dashboard/courses", badge: "3" },
  { icon: Calendar,        label: "Schedule",    path: "/student-dashboard/schedule" },
  { icon: Settings,        label: "Settings",    path: "/student-dashboard/settings" },
];

function formatLastVisit(iso) {
  if (!iso) return null;
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, badge, active, lastVisit, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column",
        width: "100%", padding: "10px 14px", borderRadius: "10px",
        border: "none", cursor: "pointer", position: "relative",
        transition: "all 0.2s ease",
        background: active
          ? "linear-gradient(135deg,rgba(251,146,60,.18),rgba(249,115,22,.10))"
          : hov ? "rgba(255,255,255,0.04)" : "transparent",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      {active && (
        <span style={{
          position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
          width: 3, height: "60%", background: "#fb923c", borderRadius: "0 3px 3px 0",
        }} />
      )}
      <span style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        color: active ? "#fb923c" : hov ? "#e2e8f0" : "#94a3b8",
        fontSize: 14, fontWeight: active ? 600 : 500, letterSpacing: "0.01em",
      }}>
        <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
        <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
        {badge && (
          <span style={{
            background: "#fb923c", color: "white", fontSize: 10,
            fontWeight: 700, padding: "1px 6px", borderRadius: 20,
          }}>{badge}</span>
        )}
        {active && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
      </span>
      {lastVisit && (
        <span style={{
          display: "flex", alignItems: "center", gap: 4,
          paddingLeft: 29, marginTop: 3,
          fontSize: 10, color: "#475569", fontWeight: 400,
        }}>
          <Clock size={9} />
          {lastVisit}
        </span>
      )}
    </button>
  );
}

// ─── Dashboard Content ────────────────────────────────────────────────────────
function DashboardContent({ firstName }) {
  return (
    <>
      <style>{`
        .stat-card:hover { transform: translateY(-3px) !important; box-shadow: 0 16px 48px rgba(0,0,0,0.5) !important; }
      `}</style>

      <div style={dash.page}>
        <div style={dash.blob1} />
        <div style={dash.blob2} />

        <div style={dash.topBar}>
          <div>
            <p style={dash.greeting}>Good morning ☀️</p>
            <h1 style={dash.welcomeText}>
              Welcome back, <span style={dash.nameHighlight}>{firstName}</span>
            </h1>
          </div>
        </div>

        <div style={dash.grid}>

          <div style={{ ...dash.card, ...dash.cardIndigo }} className="stat-card">
            <div style={{ ...dash.cardIcon, background: "rgba(99,102,241,0.15)" }}>
              <BookOpen size={20} color="#818cf8" />
            </div>
            <div style={dash.cardBody}>
              <p style={dash.cardLabel}>Enrolled Courses</p>
              <h3 style={dash.cardValue}>6</h3>
            </div>
            <div style={dash.cardTrend}>
              <TrendingUp size={12} color="#4ade80" />
              <span style={dash.trendText}>+2 this month</span>
            </div>
            <div style={{ ...dash.cardGlow, background: "rgba(99,102,241,0.08)" }} />
          </div>

          <div style={{ ...dash.card, ...dash.cardGreen }} className="stat-card">
            <div style={{ ...dash.cardIcon, background: "rgba(16,185,129,0.15)" }}>
              <Calendar size={20} color="#34d399" />
            </div>
            <div style={dash.cardBody}>
              <p style={dash.cardLabel}>Upcoming Classes</p>
              <h3 style={dash.cardValue}>3</h3>
            </div>
            <div style={dash.cardTrend}>
              <Clock size={12} color="#94a3b8" />
              <span style={dash.trendText}>Next in 2h</span>
            </div>
            <div style={{ ...dash.cardGlow, background: "rgba(16,185,129,0.08)" }} />
          </div>

          <div style={{ ...dash.card, ...dash.cardYellow }} className="stat-card">
            <div style={{ ...dash.cardIcon, background: "rgba(234,179,8,0.15)" }}>
              <Award size={20} color="#facc15" />
            </div>
            <div style={dash.cardBody}>
              <p style={dash.cardLabel}>Completed</p>
              <h3 style={dash.cardValue}>12</h3>
            </div>
            <div style={dash.cardTrend}>
              <Star size={12} color="#facc15" />
              <span style={dash.trendText}>3 certificates</span>
            </div>
            <div style={{ ...dash.cardGlow, background: "rgba(234,179,8,0.08)" }} />
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Main Export: Layout + Dashboard ─────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const token    = localStorage.getItem("token");

  const [user, setUser]           = useState({ name: "", profileImage: "" });
  const [searchFocused, setSearchFocused] = useState(false);
  const [lastVisited, setLastVisited] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lv_student") || "{}"); }
    catch { return {}; }
  });

  // Fetch profile
  useEffect(() => {
    if (!token) return;
    axios.get("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      setUser({
        name:         res.data?.name         || "Student",
        profileImage: res.data?.profileImage || "",
      });
    }).catch(() => {});
  }, []);

  // Last visited tracker
  useEffect(() => {
    const current = location.pathname;
    return () => {
      setLastVisited((lv) => {
        const updated = { ...lv, [current]: new Date().toISOString() };
        localStorage.setItem("lv_student", JSON.stringify(updated));
        return updated;
      });
    };
  }, [location.pathname]);

  const avatarSrc = user.profileImage
    ? `http://localhost:5000/uploads/${user.profileImage}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "S")}&background=f97316&color=fff&size=80&bold=true`;

  const firstName = user.name?.split(" ")[0] || "Student";
  const active    = location.pathname;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#070d1a", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        .hdr-bell:hover { color: #fb923c !important; border-color: rgba(251,146,60,0.3) !important; }
        .user-card:hover { border-color: rgba(251,146,60,0.3) !important; background: rgba(255,255,255,0.05) !important; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 232, flexShrink: 0,
        background: "#0b1120", borderRight: "1px solid #1a2338",
        display: "flex", flexDirection: "column", padding: "28px 16px",
      }}>

        {/* Logo */}
        <div style={{ padding: "0 8px", marginBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg,#fb923c,#f97316)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={16} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            TutorX
          </span>
        </div>

        <p style={{ color: "#334155", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 14px", marginBottom: 8 }}>
          Main Menu
        </p>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={active === item.path}
              lastVisit={active !== item.path ? formatLastVisit(lastVisited[item.path]) : null}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        {/* Bottom user card — only way to access profile */}
        <div
          className="user-card"
          onClick={() => navigate("/student-profile")}
          style={{
            padding: 12, background: "rgba(255,255,255,0.03)",
            border: "1px solid #1a2338", borderRadius: 12,
            display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer", transition: "all .2s",
          }}
        >
          <img src={avatarSrc} alt="avatar"
            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #fb923c" }}
          />
          <div style={{ minWidth: 0 }}>
            <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name || "Student"}
            </p>
            <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>Free Plan</p>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <header style={{
          background: "#0b1120", borderBottom: "1px solid #1a2338",
          padding: "14px 28px", display: "flex",
          justifyContent: "space-between", alignItems: "center", flexShrink: 0,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: searchFocused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${searchFocused ? "rgba(251,146,60,0.4)" : "#1a2338"}`,
            padding: "9px 16px", borderRadius: 10, width: 260, transition: "all .2s",
          }}>
            <Search size={15} color={searchFocused ? "#fb923c" : "#475569"} />
            <input
              type="text"
              placeholder="Search courses, tutors…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#e2e8f0", fontSize: 13, width: "100%", fontFamily: "'DM Sans',sans-serif",
              }}
            />
          </div>

          {/* Bell only — no avatar in header */}
          <button className="hdr-bell" style={{
            position: "relative", background: "rgba(255,255,255,0.03)",
            border: "1px solid #1a2338", borderRadius: 10,
            width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#64748b", transition: "all .2s",
          }}>
            <Bell size={16} />
            <span style={{
              position: "absolute", top: 7, right: 7,
              width: 7, height: 7, borderRadius: "50%",
              background: "#fb923c", border: "1.5px solid #0b1120",
            }} />
          </button>
        </header>

        {/* Dashboard content fills the main area */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#070d1a" }}>
          <DashboardContent firstName={firstName} />
        </main>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const dash = {
  page: { minHeight: "100%", background: "transparent", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" },
  blob1: { position: "fixed", top: -200, right: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)", pointerEvents: "none" },
  blob2: { position: "fixed", bottom: -200, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)", pointerEvents: "none" },
  topBar: { display: "flex", alignItems: "center", marginBottom: 40 },
  greeting: { fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 4, letterSpacing: "0.05em" },
  welcomeText: { fontSize: 26, fontWeight: 700, color: "#f1f5f9", margin: 0, letterSpacing: "-0.02em" },
  nameHighlight: { background: "linear-gradient(135deg,#818cf8,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 },
  card: { position: "relative", overflow: "hidden", background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "24px 24px 20px", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", gap: 12, transition: "transform 0.2s,box-shadow 0.2s" },
  cardIndigo: { borderColor: "rgba(99,102,241,0.15)" },
  cardGreen:  { borderColor: "rgba(16,185,129,0.15)" },
  cardYellow: { borderColor: "rgba(234,179,8,0.15)"  },
  cardIcon: { width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1 },
  cardLabel: { fontSize: 12, color: "#64748b", fontWeight: 500, margin: "0 0 6px", letterSpacing: "0.04em", textTransform: "uppercase" },
  cardValue: { fontSize: 32, fontWeight: 700, color: "#f1f5f9", margin: 0, letterSpacing: "-0.03em" },
  cardTrend: { display: "flex", alignItems: "center", gap: 5 },
  trendText:  { fontSize: 11, color: "#64748b", fontWeight: 500 },
  cardGlow: { position: "absolute", inset: 0, borderRadius: 20, pointerEvents: "none" },
};