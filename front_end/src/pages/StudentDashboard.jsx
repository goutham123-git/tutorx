import { BookOpen, Calendar, Award, TrendingUp, Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentDashboard() {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState({ name: "", profileImage: "" });

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

  const firstName = user.name?.split(" ")[0] || "Student";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .stat-card:hover { transform: translateY(-3px) !important; box-shadow: 0 16px 48px rgba(0,0,0,0.5) !important; }
      `}</style>

      <div style={styles.page}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />

        {/* Top bar — greeting only, no avatar */}
        <div style={styles.topBar}>
          <div>
            <p style={styles.greeting}>Good morning ☀️</p>
            <h1 style={styles.welcomeText}>
              Welcome back, <span style={styles.nameHighlight}>{firstName}</span>
            </h1>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={{ ...styles.card, ...styles.cardIndigo }} className="stat-card">
            <div style={{ ...styles.cardIcon, background: "rgba(99,102,241,0.15)" }}>
              <BookOpen size={20} color="#818cf8" />
            </div>
            <div style={styles.cardBody}>
              <p style={styles.cardLabel}>Enrolled Courses</p>
              <h3 style={styles.cardValue}>6</h3>
            </div>
            <div style={styles.cardTrend}>
              <TrendingUp size={12} color="#4ade80" />
              <span style={styles.trendText}>+2 this month</span>
            </div>
            <div style={{ ...styles.cardGlow, background: "rgba(99,102,241,0.08)" }} />
          </div>

          <div style={{ ...styles.card, ...styles.cardGreen }} className="stat-card">
            <div style={{ ...styles.cardIcon, background: "rgba(16,185,129,0.15)" }}>
              <Calendar size={20} color="#34d399" />
            </div>
            <div style={styles.cardBody}>
              <p style={styles.cardLabel}>Upcoming Classes</p>
              <h3 style={styles.cardValue}>3</h3>
            </div>
            <div style={styles.cardTrend}>
              <Clock size={12} color="#94a3b8" />
              <span style={styles.trendText}>Next in 2h</span>
            </div>
            <div style={{ ...styles.cardGlow, background: "rgba(16,185,129,0.08)" }} />
          </div>

          <div style={{ ...styles.card, ...styles.cardYellow }} className="stat-card">
            <div style={{ ...styles.cardIcon, background: "rgba(234,179,8,0.15)" }}>
              <Award size={20} color="#facc15" />
            </div>
            <div style={styles.cardBody}>
              <p style={styles.cardLabel}>Completed</p>
              <h3 style={styles.cardValue}>12</h3>
            </div>
            <div style={styles.cardTrend}>
              <Star size={12} color="#facc15" />
              <span style={styles.trendText}>3 certificates</span>
            </div>
            <div style={{ ...styles.cardGlow, background: "rgba(234,179,8,0.08)" }} />
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: { minHeight: "100%", background: "transparent", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" },
  blob1: { position: "fixed", top: -200, right: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none" },
  blob2: { position: "fixed", bottom: -200, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents: "none" },
  topBar: { display: "flex", alignItems: "center", marginBottom: 40 },
  greeting: { fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 4, letterSpacing: "0.05em" },
  welcomeText: { fontSize: 26, fontWeight: 700, color: "#f1f5f9", margin: 0, letterSpacing: "-0.02em" },
  nameHighlight: { background: "linear-gradient(135deg, #818cf8, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  card: { position: "relative", overflow: "hidden", background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "24px 24px 20px", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", gap: 12, transition: "transform 0.2s, box-shadow 0.2s" },
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