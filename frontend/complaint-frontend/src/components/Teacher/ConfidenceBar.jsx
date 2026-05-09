import { motion } from "framer-motion";


export default function ConfidenceBar({ value, color }) {
  return (
    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 6, overflow: "hidden", marginTop: 4 }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: "100%", borderRadius: 6, background: color }}
      />
    </div>
  );
}