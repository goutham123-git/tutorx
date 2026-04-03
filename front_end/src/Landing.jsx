import { useState, useEffect, useCallback } from "react";

export default function CoinRoleToggleUI() {
  const [role, setRole] = useState("student");
  const [flipped, setFlipped] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [particles, setParticles] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🌟 Added token state
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // 🌌 Particle Background
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => [
        ...prev,
        {
          id: Math.random(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 6 + 3
        }
      ].slice(-40));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // 🖱️ Mouse Parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const flipCoin = useCallback(() => {
    setFlipped(true);
    setTimeout(() => {
      setRole(prev => prev === "student" ? "teacher" : "student");
      setFlipped(false);
    }, 1200);
  }, []);

  // 🔐 HANDLE SUBMIT
  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    const url = isSignup
      ? "http://localhost:5000/api/auth/register"
      : "http://localhost:5000/api/auth/login";

    const body = isSignup
      ? { name, email, password, role }
      : { email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Something went wrong");
      } else {
        setMessage(data.message);
        if (!isSignup) {
          // 🔥 Store JWT token and user data from backend
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem("token", data.token); // Persist token
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
localStorage.setItem("role", data.user.role);

// Role-based redirect
if (data.user.role === "student") {
  window.location.href = "/student-dashboard";
} else {
  window.location.href = "/teacher-dashboard";
}
          // later → redirect based on role
        }
      }
    } catch (err) {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative transition-all duration-700">

      {/* Background */}
      <div className="absolute inset-0 transition-all duration-[2000ms]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-[2000ms]"
          style={{
            backgroundImage:
              role === "student"
                ? "url('/student-bg.jpg')"
                : "url('/teacher-bg.jpg')",
            filter: "blur(4px) brightness(0.7)"
          }}
        />

        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-50">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-wide">
            Tutor<span className="text-indigo-400">X</span>
          </h1>
          <p className="text-white/70 mt-2 text-sm tracking-widest">
            {role === "student" ? "Learn Your Way" : "Teach Your Impact"}
          </p>
        </div>
      </div>

      {/* MAIN */}
      <div className="relative z-30 flex items-center justify-center h-full">
        <div className="grid md:grid-cols-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">

          {/* LEFT */}
          <div className="p-16 text-white flex flex-col justify-center">
            <h1 className="text-6xl font-black mb-8">
              {role === "student" ? "🚀 LEARN" : "💎 TEACH"}
            </h1>
            <p className="text-xl opacity-80">
              {role === "student"
                ? "AI learning & progress tracking"
                : "Manage students & grow impact"}
            </p>
          </div>

          {/* RIGHT */}
          <div className="p-16 bg-white/90 text-center">

            {/* Coin */}
            <div onClick={flipCoin}
              className="relative mx-auto w-40 h-40 mb-10 cursor-pointer"
              style={{ perspective: "1200px" }}
            >
              <div className="absolute inset-0 blur-2xl opacity-50"
                style={{
                  background:
                    role === "student"
                      ? "linear-gradient(135deg,#22D3EE,#60A5FA)"
                      : "linear-gradient(135deg,#FB7185,#F97316)"
                }}
              />
              <div className="relative w-full h-full transition-all duration-[1400ms]"
                style={{
                  transformStyle: "preserve-3d",
                  transform: flipped
                    ? "rotateY(360deg) rotateX(360deg)"
                    : "rotateY(0deg)"
                }}
              >
                <div className="absolute w-full h-full rounded-3xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center"
                  style={{ backfaceVisibility: "hidden" }}>
                  <span className="text-5xl">
                    {role === "student" ? "🎓" : "🧑‍🏫"}
                  </span>
                </div>

                <div className="absolute w-full h-full rounded-3xl bg-gradient-to-to-br from-pink-400 to-orange-400 flex items-center justify-center"
                  style={{
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden"
                  }}>
                  <span className="text-5xl">
                    {role === "student" ? "🧑‍🏫" : "🎓"}
                  </span>
                </div>
              </div>
            </div>

            {/* FORM */}
            {isSignup && (
              <input
                className="w-full p-4 mb-4 rounded-xl border"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <input
              className="w-full p-4 mb-4 rounded-xl border"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full p-4 mb-4 rounded-xl border"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full p-4 rounded-xl text-white font-bold ${
                role === "student" ? "bg-indigo-500" : "bg-pink-500"
              }`}
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create Account"
                : "Login"}
            </button>

            {message && (
              <p className="mt-4 text-sm text-red-600">{message}</p>
            )}

            {/* 🔥 Success message for login */}
            {token && !isSignup && (
              <p className="mt-4 text-sm text-green-600 bg-green-100 p-3 rounded-xl">
                Welcome back, {user?.name || user?.email}! 🎉
              </p>
            )}

            <p
              onClick={() => setIsSignup(!isSignup)}
              className="mt-4 cursor-pointer text-indigo-500"
            >
              {isSignup ? "Already have account?" : "New here? Signup"}
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
