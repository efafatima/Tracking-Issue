




import StarRating from "../../components/Complaint/StarRating";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RatingModal({ complaint, onClose, onSubmit }) {
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false); // ✅ NEW: success state

  const handleSubmit = async () => {
    await onSubmit(complaint.id, stars, feedback);
    setSubmitted(true); // ✅ Show success screen
    setTimeout(() => {
      onClose(); // ✅ Auto-close after 1.8s
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={!submitted ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 24, padding: "36px 32px",
          width: "100%", maxWidth: 400, position: "relative",
          boxShadow: "0 24px 80px rgba(61,114,224,0.18)",
          border: "1px solid rgba(91,154,245,0.12)",
          overflow: "hidden",
        }}
      >
        {/* Top gradient bar */}
        <motion.div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          height: 4, width: 80, borderRadius: "0 0 8px 8px",
          background: submitted
            ? "linear-gradient(90deg,#22c55e,#16a34a)"
            : "linear-gradient(90deg,#5b9af5,#3d72e0,#7ab5f8,#5b9af5)",
          backgroundSize: "200%",
        }}
          animate={!submitted ? { backgroundPosition: ["0%", "100%", "0%"] } : {}}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <AnimatePresence mode="wait">

          {/* ✅ SUCCESS STATE */}
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.85, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: "center", padding: "8px 0" }}
            >
              {/* Animated checkmark circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
                style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 36, margin: "0 auto 16px",
                  boxShadow: "0 8px 28px rgba(34,197,94,0.3)",
                }}
              >
                ✓
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{ fontSize: "1.15rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 8 }}
              >
                Rating Submitted!
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={{ fontSize: 13, color: "#64748b", fontWeight: 500, lineHeight: 1.5 }}
              >
                Your response has been submitted.<br />
                Thank you for your feedback!
              </motion.p>

              {/* Stars display */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 4 }}
              >
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.45 + i * 0.06, type: "spring", stiffness: 250 }}
                    style={{ fontSize: 22, color: i <= stars ? "#f59e0b" : "#e2e8f0" }}
                  >★</motion.span>
                ))}
              </motion.div>

              {/* Auto-close hint */}
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{ fontSize: 11, color: "#cbd5e1", marginTop: 14, fontWeight: 500 }}
              >
                Closing automatically...
              </motion.p>
            </motion.div>

          ) : (

            /* FORM STATE */
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>⭐</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
                  Rate this Solution
                </h3>
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, fontWeight: 500 }}>
                  "{complaint.title}"
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <StarRating value={stars} onChange={setStars} />
              </div>

              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Share your feedback (optional)..."
                rows={3}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12,
                  border: "1.5px solid #e2e8f0", fontSize: 13, color: "#1e293b",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  resize: "none", outline: "none",
                  background: "rgba(248,250,255,0.8)",
                }}
                onFocus={e => e.target.style.borderColor = "#5b9af5"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <motion.button onClick={onClose}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, height: 44, borderRadius: 11, border: "1.5px solid #e2e8f0",
                    background: "white", color: "#64748b", fontWeight: 700, fontSize: 13,
                    cursor: "pointer",
                  }}>
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(61,114,224,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  disabled={stars === 0}
                  style={{
                    flex: 2, height: 44, borderRadius: 11, border: "none",
                    background: stars === 0
                      ? "#e2e8f0"
                      : "linear-gradient(90deg,#5b9af5,#3d72e0)",
                    color: stars === 0 ? "#94a3b8" : "white",
                    fontWeight: 700, fontSize: 13, cursor: stars === 0 ? "not-allowed" : "pointer",
                    transition: "background 0.3s",
                  }}>
                  Submit Rating
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}