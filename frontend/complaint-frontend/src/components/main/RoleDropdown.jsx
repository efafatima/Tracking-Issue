import { motion } from "framer-motion";

export default function RoleDropdown({ variants }) {
  return (
    <motion.div variants={variants} style={{
      width: "100%",
      padding: "13px 14px 13px 42px",
      fontSize: 13,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: "rgba(248,250,255,0.8)",
      borderRadius: 12,
      border: "1.5px solid #e2e8f0",
      color: "#1e293b",
      position: "relative",
      fontWeight: 700,
    }}>
      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>🎓</span>
      Student
      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 2 }}>
        Public signup is limited to student accounts. Staff roles are assigned by authorized users.
      </div>
    </motion.div>
  );
}
