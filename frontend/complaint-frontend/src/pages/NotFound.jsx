import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
}));

function FloatingParticle({ x, y, size, duration, delay }) {
  return (
    <motion.div
      style={{
        position: "absolute", left: `${x}%`, top: `${y}%`,
        width: size, height: size, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(91,154,245,0.55), rgba(61,114,224,0.1))",
        pointerEvents: "none",
      }}
      animate={{ y: [0, -28, 0], x: [0, 12, -8, 0], opacity: [0.25, 0.75, 0.25], scale: [1, 1.5, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function UnpluggedIllustration() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
      <div style={{ position: "relative", width: 200, height: 180 }}>
        {/* Glow rings */}
        <motion.div style={{
          position: "absolute", width: 160, height: 160, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(91,154,245,0.1), transparent)",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          border: "1px solid rgba(91,154,245,0.12)",
        }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div style={{
          position: "absolute", width: 120, height: 120, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(91,154,245,0.07), transparent)",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.5, delay: 0.4, repeat: Infinity }}
        />

        <svg width="200" height="180" viewBox="0 0 200 180" fill="none">
          <defs>
            <linearGradient id="pg1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b9af5" />
              <stop offset="100%" stopColor="#3d72e0" />
            </linearGradient>
            <linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d72e0" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>

          {/* LEFT PLUG — socket (female) */}
          {/* Cable top */}
          <motion.path d="M72 10 C72 10 70 30 72 52"
            stroke="#3d72e0" strokeWidth="4" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          />
          {/* Body */}
          <motion.rect x="58" y="52" width="28" height="38" rx="7" fill="url(#pg2)"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          />
          {/* Holes */}
          <motion.rect x="65" y="60" width="5" height="10" rx="2.5" fill="rgba(255,255,255,0.3)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} />
          <motion.rect x="74" y="60" width="5" height="10" rx="2.5" fill="rgba(255,255,255,0.3)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
          {/* Connector */}
          <motion.rect x="63" y="87" width="18" height="6" rx="3" fill="#5b9af5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} />
          {/* Cable bottom curving right */}
          <motion.path d="M72 93 C72 120 120 125 130 155 C138 175 130 178 120 178"
            stroke="#3d72e0" strokeWidth="4" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, delay: 0.4 }}
          />

          {/* Sparks left */}
          {[[50,72,38,68],[47,80,34,82],[51,65,40,60]].map(([x1,y1,x2,y2], i) => (
            <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#7ab5f8" strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0,1,0,1,0] }}
              transition={{ delay: 1.2 + i*0.2, duration: 0.45, repeat: Infinity, repeatDelay: 2.3 }}
            />
          ))}

          {/* RIGHT PLUG — prongs (male) */}
          {/* Prongs */}
          <motion.rect x="118" y="38" width="5" height="16" rx="2.5" fill="#3d72e0"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} />
          <motion.rect x="127" y="38" width="5" height="16" rx="2.5" fill="#3d72e0"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} />
          {/* Body */}
          <motion.rect x="112" y="52" width="28" height="38" rx="7" fill="url(#pg1)"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          />
          {/* Connector */}
          <motion.rect x="119" y="87" width="18" height="6" rx="3" fill="#7ab5f8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} />
          {/* Cable bottom */}
          <motion.path d="M128 93 C128 115 80 118 68 148 C60 168 68 175 80 178"
            stroke="#3d72e0" strokeWidth="4" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, delay: 0.3 }}
          />
          {/* Cable top going up */}
          <motion.path d="M128 52 C128 35 130 20 128 10"
            stroke="#3d72e0" strokeWidth="4" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          />

          {/* Sparks right */}
          {[[150,72,162,68],[153,80,166,82],[149,63,160,58]].map(([x1,y1,x2,y2], i) => (
            <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#7ab5f8" strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0,1,0,1,0] }}
              transition={{ delay: 1.5 + i*0.2, duration: 0.45, repeat: Infinity, repeatDelay: 2.3 }}
            />
          ))}

          {/* Gap dots between plugs */}
          {[[94,68,0.9],[100,62,1.1],[106,68,1.3]].map(([cx,cy,d], i) => (
            <motion.circle key={i} cx={cx} cy={cy} r="3" fill="#5b9af5"
              animate={{ opacity: [0,0.9,0], scale: [0,1,0] }}
              transition={{ delay: d, duration: 1, repeat: Infinity, repeatDelay: 1.6 }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function NotFound() {
  const [count, setCount] = useState(10);

  useEffect(() => {
    if (count <= 0) { window.location.href = "/"; return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-40px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.92)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-40px,20px) scale(1.08)} 66%{transform:translate(20px,-30px) scale(0.95)} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,20px) scale(1.1)} }
        @keyframes shimmer { 0%{transform:translateX(-100%) rotate(25deg)} 100%{transform:translateX(350%) rotate(25deg)} }
        .blob-a{animation:blob1 8s ease-in-out infinite}
        .blob-b{animation:blob2 10s ease-in-out infinite}
        .blob-c{animation:blob3 7s ease-in-out infinite}
        .shimmer-btn::after{content:'';position:absolute;top:0;left:0;width:35%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);animation:shimmer 2.8s ease-in-out infinite}
        .grid-bg{background-image:linear-gradient(rgba(91,154,245,0.055) 1px,transparent 1px),linear-gradient(90deg,rgba(91,154,245,0.055) 1px,transparent 1px);background-size:38px 38px}
      `}</style>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden grid-bg"
        style={{ background: "linear-gradient(145deg,#c8ddf5 0%,#dceaf9 30%,#eef4fd 60%,#e0eaf8 100%)", minHeight: "100vh" }}
      >
        {/* Blobs */}
        <div className="blob-a absolute" style={{ top: "-80px", left: "-80px", width: 360, height: 360, borderRadius: "60% 40% 55% 45%/50% 60% 40% 50%", background: "radial-gradient(circle at 35% 35%, rgba(168,200,248,0.7), rgba(200,224,252,0.25))", filter: "blur(32px)" }} />
        <div className="blob-b absolute" style={{ bottom: "-100px", right: "-100px", width: 420, height: 420, borderRadius: "45% 55% 40% 60%/60% 45% 55% 40%", background: "radial-gradient(circle at 65% 65%, rgba(144,184,240,0.6), rgba(176,204,248,0.2))", filter: "blur(38px)" }} />
        <div className="blob-c absolute" style={{ top: "40%", right: "-30px", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(144,184,240,0.5), transparent)", filter: "blur(20px)" }} />
        <div className="blob-a absolute" style={{ bottom: "8%", left: "-20px", width: 130, height: 130, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,200,248,0.45), transparent)", filter: "blur(16px)" }} />

        {PARTICLES.map(p => <FloatingParticle key={p.id} {...p} />)}

        {/* Single Card */}
        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          style={{
            position: "relative", zIndex: 10, width: 380,
            background: "white", borderRadius: 28, padding: "44px 38px 36px",
            boxShadow: "0 20px 80px rgba(61,114,224,0.13), 0 4px 20px rgba(61,114,224,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
            border: "1px solid rgba(255,255,255,0.85)",
          }}
        >
          {/* Animated top bar */}
          <motion.div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            height: 4, borderRadius: "0 0 8px 8px", width: 80,
            background: "linear-gradient(90deg,#5b9af5,#3d72e0,#7ab5f8,#5b9af5)",
            backgroundSize: "200%",
          }}
            animate={{ backgroundPosition: ["0%","100%","0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Decorative dots */}
          <div style={{ position: "absolute", top: 18, right: 18, display: "flex", gap: 5 }}>
            {[0.25,0.55,1].map((o,i) => (
              <motion.div key={i}
                style={{ width: 6, height: 6, borderRadius: "50%", background: `rgba(91,154,245,${o})` }}
                animate={{ scale: [1,1.5,1], opacity: [o,1,o] }}
                transition={{ duration: 2, delay: i*0.3, repeat: Infinity }}
              />
            ))}
          </div>

          {/* Disconnected badge */}
          <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(239,68,68,0.07)", borderRadius: 20,
              padding: "5px 12px", border: "1px solid rgba(239,68,68,0.18)",
            }}>
              <motion.div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }}
                animate={{ opacity: [1,0.2,1] }} transition={{ duration: 1.1, repeat: Infinity }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: "#ef4444", letterSpacing: "0.08em" }}>DISCONNECTED</span>
            </div>
          </motion.div>

          {/* Illustration */}
          <motion.div variants={fadeUp}>
            <UnpluggedIllustration />
          </motion.div>

          {/* BZU label */}
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 6 }}>
            <motion.span style={{
              display: "inline-block", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              background: "linear-gradient(90deg,#5b9af5,#3d72e0)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}
              animate={{ opacity: [0.6,1,0.6] }} transition={{ duration: 2.5, repeat: Infinity }}>
              ✦ BZU Complaint System ✦
            </motion.span>
          </motion.div>

          {/* 404 */}
          <motion.h1 variants={fadeUp} style={{
            textAlign: "center", fontSize: "5.5rem", fontWeight: 900,
            lineHeight: 1, letterSpacing: "-0.05em", marginBottom: 6,
            background: "linear-gradient(135deg,#5b9af5 0%,#3d72e0 60%,#1e3a8a 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            404
          </motion.h1>

          <motion.h2 variants={fadeUp} style={{
            textAlign: "center", fontSize: "1.25rem", fontWeight: 900,
            color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 8,
          }}>
            Page{" "}
            <span style={{ background: "linear-gradient(135deg,#5b9af5,#3d72e0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Not Found
            </span>
          </motion.h2>

          <motion.p variants={fadeUp} style={{
            textAlign: "center", fontSize: 12.5, color: "#94a3b8",
            fontWeight: 500, lineHeight: 1.7, marginBottom: 20,
          }}>
            The page you're looking for doesn't exist<br />or has been moved. Let's get you back.
          </motion.p>

          {/* Divider */}
          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <motion.div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#e2e8f0)" }}
              initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.6 }} />
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#5b9af5,#3d72e0)" }} />
            <motion.div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#e2e8f0,transparent)" }}
              initial={{ scaleX: 0, originX: 1 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.6 }} />
          </motion.div>

          {/* Buttons */}
          <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <motion.a href="/"
              className="shimmer-btn"
              whileHover={{ scale: 1.025, y: -2, boxShadow: "0 10px 30px rgba(61,114,224,0.42)" }}
              whileTap={{ scale: 0.975 }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 20px", height: 50, borderRadius: 13, textDecoration: "none",
                background: "linear-gradient(90deg,#5b9af5 0%,#3d72e0 100%)", color: "white",
                fontWeight: 700, fontSize: 14,
                boxShadow: "0 6px 22px rgba(61,114,224,0.32), inset 0 1px 0 rgba(255,255,255,0.18)",
                position: "relative", overflow: "hidden",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🏠</span>
                Go to Homepage
              </span>
              <span style={{ fontSize: 16, opacity: 0.8 }}>→</span>
            </motion.a>

            <motion.a href="/login"
              whileHover={{ scale: 1.025, y: -2 }} whileTap={{ scale: 0.975 }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 20px", height: 50, borderRadius: 13, textDecoration: "none",
                background: "white", color: "#3d72e0", fontWeight: 700, fontSize: 14,
                border: "2px solid rgba(91,154,245,0.3)",
                boxShadow: "0 4px 16px rgba(61,114,224,0.08)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(91,154,245,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🔐</span>
                Back to Login
              </span>
              <span style={{ fontSize: 16, color: "#5b9af5", opacity: 0.7 }}>→</span>
            </motion.a>
          </motion.div>

          {/* Countdown */}
          <motion.div variants={fadeUp} style={{
            marginTop: 16, padding: "10px 14px", borderRadius: 12,
            background: "rgba(91,154,245,0.06)", border: "1px solid rgba(91,154,245,0.15)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <motion.div style={{ width: 8, height: 8, borderRadius: "50%", background: "#5b9af5", flexShrink: 0 }}
              animate={{ opacity: [1,0.2,1] }} transition={{ duration: 1, repeat: Infinity }} />
            <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 500 }}>
              Redirecting to homepage in{" "}
              <span style={{ fontWeight: 800, color: "#3d72e0" }}>{count}s</span>
            </span>
            <div style={{ marginLeft: "auto", width: 34, height: 34, position: "relative", flexShrink: 0 }}>
              <svg width="34" height="34" viewBox="0 0 34 34" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="17" cy="17" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <motion.circle cx="17" cy="17" r="14" fill="none"
                  stroke="url(#cg)" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 14}
                  animate={{ strokeDashoffset: 2 * Math.PI * 14 * (1 - count / 10) }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#5b9af5" />
                    <stop offset="100%" stopColor="#3d72e0" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 10, fontWeight: 800, color: "#3d72e0" }}>{count}</span>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p variants={fadeUp} style={{ textAlign: "center", fontSize: 10.5, color: "#cbd5e1", marginTop: 16, fontWeight: 500 }}>
            Bahauddin Zakariya University © {new Date().getFullYear()}
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}