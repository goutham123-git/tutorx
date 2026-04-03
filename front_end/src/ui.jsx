import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

function NetworkBackground() {
  const particles = Array.from({ length: 35 });
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-blue-900/20" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-grid-slate-900/50 [background-image:linear-gradient(rgba(255,255,255,.1),transparent_1px,transparent),linear-gradient(90deg,rgba(255,255,255,.1),transparent_1px,transparent)] [background-size:40px_40px]" />
      </div>

      {/* Floating particles */}
      <svg className="absolute inset-0 w-full h-full">
        {particles.map((_, i) => {
          const x = (i % 8) * 12.5;
          const y = Math.floor(i / 5) * 20;
          return (
            <motion.circle
              key={`particle-${i}`}
              cx={`${x}%`}
              cy={`${y}%`}
              r="2.5"
              fill="url(#particleGradient)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.5"
              animate={{
                cx: [`${x}%`, `${x + (Math.sin(i) * 5)}%`, `${x}%`],
                cy: [`${y}%`, `${y - 8}%`, `${y}%`],
                r: [2.5, 4, 2.5],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: 6 + (i % 5),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </svg>

      {/* Network connections */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`connection-${i}`}
          className="absolute w-24 h-0.5 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full opacity-30"
          style={{
            left: `${(i % 4) * 25}%`,
            top: `${20 + (Math.floor(i / 3) * 25)}%`,
          }}
          animate={{
            x: [-10, 15, -10],
            y: [-5, 10, -5],
            scaleX: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 8 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Central glow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <div className="w-72 h-72 md:w-96 md:h-96 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-yellow-500/20 rounded-full blur-3xl shadow-2xl border-4 border-blue-500/30" />
      </motion.div>

      {/* SVG gradient definition */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <radialGradient id="particleGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9">
              <animate attributeName="stopOpacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite"/>
            </stop>
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.6">
              <animate attributeName="stopOpacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function Feature({ title }) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.08, 
        rotateX: 8, 
        rotateY: 8,
        boxShadow: "0 25px 50px rgba(251, 191, 36, 0.3)"
      }}
      whileTap={{ scale: 0.96 }}
      className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl text-center cursor-pointer group border border-white/10 hover:border-yellow-400/50 transition-all"
    >
      <motion.div
        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-red-400/20 flex items-center justify-center shadow-xl border border-yellow-400/30"
        animate={{ 
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "linear" }
        }}
        whileHover={{ scale: 1.2, backgroundColor: "rgba(251, 191, 36, 0.2)" }}
      >
        <span className="text-2xl drop-shadow-lg">✨</span>
      </motion.div>
      <h3 className="font-black text-xl text-white group-hover:text-yellow-300 group-hover:drop-shadow-lg transition-all duration-300 tracking-wide">
        {title}
      </h3>
    </motion.div>
  );
}

export default function UI() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const scaleX = useSpring(useTransform(scrollYProgress, [0, 0.2], [1, 1.12]), {
    stiffness: 120,
    damping: 25,
  });

  const floatingAnimation = {
    y: [-12, 12, -12],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white min-h-screen overflow-x-hidden relative">
      {/* Professional animated background - covers entire page */}
      <NetworkBackground />
      
      <motion.div style={{ y, scaleX }} className="min-h-screen relative z-40">
        {/* NAVBAR */}
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed w-full flex justify-between px-12 py-8 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/10 shadow-2xl"
        >
          <motion.h1 
            className="text-3xl font-black bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg"
            whileHover={{ scale: 1.05 }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.2}
          >
            Tutor<span className="text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text drop-shadow-xl">X</span>
          </motion.h1>

          <div className="flex gap-10 items-center">
            {['About', 'Features', 'Contact'].map((item, idx) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative font-semibold text-lg px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-300"
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: "rgba(251, 191, 36, 0.2)",
                  color: "#FBBF24"
                }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
              >
                {item}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/30 to-yellow-500/30 -z-10"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(251, 191, 36, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-black px-10 py-3 rounded-3xl font-bold text-lg shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 border-2 border-yellow-400/50"
            >
              Login
            </motion.button>
          </div>
        </motion.nav>

        {/* HERO */}
        <section className="min-h-screen flex items-center px-16 pt-32 relative z-40">
          <div className="grid md:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h1 className="text-8xl md:text-9xl lg:text-[10rem] font-black mb-12 leading-[0.9] bg-gradient-to-r from-white via-yellow-100 to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl">
                Welcome to our <br />
                <span>Tutor<span className="text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text drop-shadow-2xl">X</span></span> family
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 mb-12 max-w-lg leading-relaxed drop-shadow-xl">
                Connecting students and tutors through AI-powered mentorship and intelligent learning systems.
              </p>
              <motion.button
                onClick={() => navigate("/login")}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 30px 60px rgba(251, 191, 36, 0.5)",
                  y: -5
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-black px-16 py-8 rounded-3xl font-black text-2xl shadow-2xl hover:shadow-yellow-500/60 transition-all duration-500 border-4 border-yellow-400/50 backdrop-blur-sm"
              >
                GET STARTED NOW
              </motion.button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="flex justify-center relative"
            >
              <motion.div
                animate={floatingAnimation}
                className="w-96 h-96 md:w-[28rem] md:h-[28rem] bg-gradient-to-br from-white/5 via-yellow-400/10 to-orange-500/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center shadow-2xl border border-white/20"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: [0, 15, -15, 0]
                  }}
                  transition={{ 
                    scale: { duration: 4, repeat: Infinity },
                    rotate: { duration: 6, repeat: Infinity }
                  }}
                  className="w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-gradient-to-br from-yellow-400/30 via-orange-400/30 to-red-400/30 flex items-center justify-center text-[6rem] md:text-[8rem] shadow-2xl border-4 border-yellow-400/40 drop-shadow-2xl"
                >
                  👨‍🎓
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="min-h-screen flex items-center justify-center px-16 py-32 relative z-40">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-24 items-center max-w-7xl mx-auto"
          >
            <motion.div
              initial={{ x: -80, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-7xl md:text-8xl font-black mb-12 bg-gradient-to-r from-white via-yellow-100 to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl">
                ABOUT
              </h2>
              <p className="text-2xl text-white/90 leading-relaxed max-w-lg mb-8 drop-shadow-lg">
                TutorX is a modern learning ecosystem where students and teachers connect through intelligent tools and mentorship.
              </p>
              <p className="text-xl text-white/70 leading-relaxed max-w-lg drop-shadow-lg">
                Our platform enables flexible learning both online and offline while tracking performance and improving student outcomes.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex justify-center"
            >
              <motion.div
                animate={floatingAnimation}
                className="w-80 h-80 rounded-3xl bg-gradient-to-br from-white/10 via-blue-400/10 to-purple-500/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl border border-white/20"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="w-60 h-60 rounded-2xl bg-gradient-to-r from-yellow-400/30 to-purple-500/30 flex items-center justify-center text-[7rem] shadow-xl border-4 border-blue-400/30"
                >
                  📚
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* FEATURES */}
        <section id="features" className="min-h-screen px-10 py-40 relative z-40">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-8xl font-black mb-12 bg-gradient-to-r from-white via-yellow-200 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl">
              OUR TUTOR<span className="text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text drop-shadow-xl">X</span> FEATURES
            </h2>
            <motion.div 
              className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-yellow-400/40"
              animate={floatingAnimation}
            >
              <span className="text-4xl drop-shadow-lg">🚀</span>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
            <Feature title="Tutor Finder" />
            <Feature title="Online / Offline" />
            <Feature title="Daily Assignments" />
            <Feature title="AI Tutor" />
            <Feature title="Track Performance" />
            <Feature title="Tutor Collaboration" />
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="min-h-screen flex items-center justify-center px-10 py-32 relative z-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              animate={{ 
                y: [0, -40, 0],
                scale: [1, 1.08, 1],
                rotate: [0, 12, -12, 0]
              }}
              transition={{ 
                y: { duration: 4, repeat: Infinity },
                scale: { duration: 4, repeat: Infinity },
                rotate: { duration: 5, repeat: Infinity }
              }}
              className="text-[10rem] mb-16 mx-auto drop-shadow-2xl"
            >
              📬
            </motion.div>
            
            <h2 className="text-8xl font-black mb-16 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent drop-shadow-2xl">
              CONTACT
            </h2>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 60 }}
              whileInView={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-2xl text-white p-20 rounded-3xl max-w-3xl mx-auto border border-white/20 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500"
              whileHover={{ scale: 1.02 }}
            >
              <div className="space-y-8">
                <motion.p 
                  className="text-3xl font-semibold flex items-center gap-6 group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-400/50 transition-all"
                  whileHover={{ x: 15, backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                >
                  <span className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl flex-shrink-0">✉️</span>
                  Email: <a href="mailto:gouthamsrinivas@gmail.com" className="hover:text-yellow-400 font-bold transition-colors">gouthamsrinivas@gmail.com</a>
                </motion.p>
                <motion.p 
                  className="text-3xl font-semibold flex items-center gap-6 group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-400/50 transition-all"
                  whileHover={{ x: 15, backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                >
                  <span className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl flex-shrink-0">📱</span>
                  Phone: <a href="tel:+919494415511" className="hover:text-yellow-400 font-bold transition-colors">+91 9494415511</a>
                </motion.p>
                <motion.p 
                  className="text-3xl font-semibold flex items-center gap-6 group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-400/50 transition-all"
                  whileHover={{ x: 15, backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                >
                  <span className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl flex-shrink-0">💻</span>
                  GitHub: <a href="https://github.com/goutham123-git" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 font-bold transition-colors">goutham123-git</a>
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </motion.div>
    </div>
  );
}
