import { useState } from "react";
import { motion,AnimatePresence } from "framer-motion";
import AttachmentsSection from "../Complaint/AttachmentsSection";

export default function SolutionModal({ complaint, onClose, onSubmit }) {
  const [text, setText] = useState(complaint.solution || "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setTimeout(() => { onSubmit(complaint.id, text); onClose(); }, 900);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 24, padding: "36px 32px",
          width: "100%", maxWidth: 440, position: "relative",
          boxShadow: "0 24px 80px rgba(61,114,224,0.18)",
          border: "1px solid rgba(91,154,245,0.12)",
        }}
      >
        <motion.div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          height: 4, width: 80, borderRadius: "0 0 8px 8px",
          background: "linear-gradient(90deg,#5b9af5,#3d72e0,#7ab5f8,#5b9af5)",
          backgroundSize: "200%",
        }}
          animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg,#5b9af5,#3d72e0)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>💬</div>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "#0f172a" }}>Add Solution Comment</h3>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 2 }}>"{complaint.title}"</p>
          </div>
        </div>

        <AttachmentsSection attachments={complaint.attachments} />

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Describe the solution in detail..."
          rows={5}
          autoFocus
          style={{
            width: "100%", padding: "13px 15px", borderRadius: 13,
            border: "1.5px solid #e2e8f0", fontSize: 13, color: "#1e293b",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            resize: "none", outline: "none",
            background: "rgba(248,250,255,0.9)",
            lineHeight: 1.6,
            transition: "border 0.2s, box-shadow 0.2s",
          }}
          onFocus={e => { e.target.style.borderColor = "#5b9af5"; e.target.style.boxShadow = "0 0 0 3px rgba(91,154,245,0.13)"; }}
          onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <motion.button onClick={onClose}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, height: 46, borderRadius: 12, border: "1.5px solid #e2e8f0",
              background: "white", color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>
            Cancel
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            whileHover={!loading && !done ? { scale: 1.02, boxShadow: "0 8px 24px rgba(61,114,224,0.35)" } : {}}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 2, height: 46, borderRadius: 12, border: "none",
              background: done
                ? "linear-gradient(90deg,#22c55e,#16a34a)"
                : "linear-gradient(90deg,#5b9af5,#3d72e0)",
              color: "white", fontWeight: 700, fontSize: 13,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background 0.4s",
            }}>
            <AnimatePresence mode="wait">
              {loading
                ? <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : done
                  ? <motion.span key="done" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}>✓ Saved!</motion.span>
                  : <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Save Comment</motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}