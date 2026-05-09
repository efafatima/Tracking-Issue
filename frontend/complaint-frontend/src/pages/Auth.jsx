import { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 3,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
}));

function FloatingParticle({ x, y, size, duration, delay }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(91,154,245,0.5), rgba(61,114,224,0.15))",
        pointerEvents: "none",
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, -10, 0],
        opacity: [0.3, 0.8, 0.3],
        scale: [1, 1.4, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function PulsingRing({ delay }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        borderRadius: "50%",
        border: "1.5px solid rgba(91,154,245,0.25)",
        pointerEvents: "none",
      }}
      animate={{
        width: [80, 160],
        height: [80, 160],
        opacity: [0.6, 0],
        x: [-40, -80],
        y: [-40, -80],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

export default function BZUWelcome() {
  const [hovered, setHovered] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const fadeIn = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes bgShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes blob1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-40px) scale(1.1); }
          66% { transform: translate(-20px,20px) scale(0.92); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(-40px,20px) scale(1.08); }
          66% { transform: translate(20px,-30px) scale(0.95); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,20px) scale(1.1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(300%) rotate(25deg); }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to { width: 50px; }
        }
        .blob-1 { animation: blob1 8s ease-in-out infinite; }
        .blob-2 { animation: blob2 10s ease-in-out infinite; }
        .blob-3 { animation: blob3 7s ease-in-out infinite; }
        .btn-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          animation: shimmer 2.5s ease-in-out infinite;
        }
        .grid-bg {
          background-image: linear-gradient(rgba(91,154,245,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(91,154,245,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden grid-bg"
        style={{
          background: "linear-gradient(145deg, #c8ddf5 0%, #dceaf9 30%, #eef4fd 60%, #e0eaf8 100%)",
          minHeight: "100vh",
        }}
      >
        {/* Animated background blobs */}
        <div className="blob-1 absolute" style={{
          top: "-80px", left: "-80px", width: 380, height: 380,
          borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
          background: "radial-gradient(circle at 35% 35%, rgba(168,200,248,0.7), rgba(200,224,252,0.3))",
          filter: "blur(30px)",
        }} />
        <div className="blob-2 absolute" style={{
          bottom: "-100px", right: "-100px", width: 450, height: 450,
          borderRadius: "45% 55% 40% 60% / 60% 45% 55% 40%",
          background: "radial-gradient(circle at 65% 65%, rgba(144,184,240,0.6), rgba(176,204,248,0.2))",
          filter: "blur(35px)",
        }} />
        <div className="blob-3 absolute" style={{
          top: "40%", right: "-30px", width: 180, height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(144,184,240,0.5), rgba(200,224,252,0.2))",
          filter: "blur(20px)",
        }} />
        <div className="blob-1 absolute" style={{
          bottom: "10%", left: "-20px", width: 140, height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,200,248,0.4), transparent)",
          filter: "blur(16px)",
        }} />

        {/* Floating particles */}
        {PARTICLES.map(p => <FloatingParticle key={p.id} {...p} />)}

        {/* Card */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-10 bg-white rounded-3xl"
          style={{
            width: 380,
            padding: "44px 40px 36px",
            boxShadow: "0 20px 80px rgba(61,114,224,0.14), 0 4px 20px rgba(61,114,224,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          {/* Glossy top bar */}
          <motion.div
            variants={fadeIn}
            style={{
              position: "absolute", top: 0, left: "50%",
              transform: "translateX(-50%)",
              width: 80, height: 4, borderRadius: "0 0 8px 8px",
              background: "linear-gradient(90deg, #5b9af5, #3d72e0, #7ab5f8)",
              backgroundSize: "200%",
            }}
            animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Top decorative dots */}
          <div style={{ position: "absolute", top: 18, right: 20, display: "flex", gap: 5 }}>
            {[0.3, 0.6, 1].map((o, i) => (
              <motion.div key={i}
                style={{ width: 6, height: 6, borderRadius: "50%", background: `rgba(91,154,245,${o})` }}
                animate={{ scale: [1, 1.4, 1], opacity: [o, 1, o] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
          </div>

          {/* Logo section */}
          <motion.div variants={fadeIn} className="flex flex-col items-center mb-6">
            <div style={{ position: "relative" }}>
              <PulsingRing delay={0} />
              <PulsingRing delay={1.5} />
              <motion.div
                whileHover={{ scale: 1.07, rotate: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  width: 110, height: 110, borderRadius: "50%",
                  overflow: "hidden", position: "relative", zIndex: 1,
                  boxShadow: "0 8px 32px rgba(61,114,224,0.2), 0 0 0 4px rgba(91,154,245,0.15)",
                  border: "3px solid rgba(255,255,255,0.9)",
                }}
              >
                <img src="/bzu-logo.png" alt="BZU Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div variants={fadeUp} className="text-center mb-1">
            <motion.span
              style={{
                display: "inline-block", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.15em", textTransform: "uppercase",
                color: "#5b9af5", marginBottom: 6,
                background: "linear-gradient(90deg,#5b9af5,#3d72e0)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              ✦ Welcome to ✦
            </motion.span>

            <motion.h1
              style={{
                fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.2,
                color: "#0f172a", letterSpacing: "-0.03em",
              }}
            >
              BZU Complaint
              <br />
              <span style={{
                background: "linear-gradient(135deg,#5b9af5 0%,#3d72e0 50%,#7ab5f8 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                System
              </span>
            </motion.h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p variants={fadeUp} style={{
            textAlign: "center", fontSize: 13, color: "#94a3b8",
            marginBottom: 24, fontWeight: 500, lineHeight: 1.6,
          }}>
            Streamline, manage & track your<br />departmental complaints with ease.
          </motion.p>

          {/* Animated divider */}
          <motion.div variants={fadeUp} style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
          }}>
            <motion.div
              style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#e2e8f0)" }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            />
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "linear-gradient(135deg,#5b9af5,#3d72e0)",
            }} />
            <motion.div
              style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#e2e8f0,transparent)" }}
              initial={{ scaleX: 0, originX: 1 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            />
          </motion.div>

          {/* Buttons */}
          <motion.div variants={stagger} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Login */}
            <motion.a
              variants={fadeUp}
              href="/login"
              onMouseEnter={() => setHovered("login")}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.975 }}
              className="btn-shimmer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 22px", height: 52, borderRadius: 14,
                background: "linear-gradient(90deg,#5b9af5 0%,#3d72e0 100%)",
                textDecoration: "none", color: "white", fontWeight: 700, fontSize: 15,
                boxShadow: "0 6px 24px rgba(61,114,224,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                overflow: "hidden", position: "relative",
                transition: "box-shadow 0.2s",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}>🔐</span>
                Login
              </span>
              <motion.span
                animate={{ x: hovered === "login" ? 4 : 0 }}
                transition={{ type: "spring", stiffness: 400 }}
                style={{ fontSize: 18, opacity: 0.8 }}
              >→</motion.span>
            </motion.a>

            {/* Register */}
            <motion.a
              variants={fadeUp}
              href="/register"
              onMouseEnter={() => setHovered("register")}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.975 }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 22px", height: 52, borderRadius: 14,
                background: "white",
                textDecoration: "none", color: "#3d72e0", fontWeight: 700, fontSize: 15,
                border: "2px solid rgba(91,154,245,0.3)",
                boxShadow: "0 4px 16px rgba(61,114,224,0.1)",
                position: "relative", overflow: "hidden",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(91,154,245,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}>✏️</span>
                Register
              </span>
              <motion.span
                animate={{ x: hovered === "register" ? 4 : 0 }}
                transition={{ type: "spring", stiffness: 400 }}
                style={{ fontSize: 18, color: "#5b9af5", opacity: 0.7 }}
              >→</motion.span>
            </motion.a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            style={{
              display: "flex", justifyContent: "center", gap: 24,
              marginTop: 22, paddingTop: 18,
              borderTop: "1px solid #f1f5f9",
            }}
          >
            {[
              { num: "2.4K+", label: "Students" },
              { num: "98%", label: "Resolved" },
              { num: "24h", label: "Response" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                style={{ textAlign: "center" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: "#1e40af" }}>{stat.num}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.p
            variants={fadeUp}
            style={{ textAlign: "center", fontSize: 11, color: "#cbd5e1", marginTop: 16, fontWeight: 500 }}
          >
            Bahauddin Zakariya University © {new Date().getFullYear()}
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}