import { useState } from "react";
import { motion } from "framer-motion";

export default function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <motion.button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 22, lineHeight: 1,
            color: n <= (hovered || value) ? "#f59e0b" : "#e2e8f0",
            transition: "color 0.15s",
          }}
        >★</motion.button>
      ))}
    </div>
  );
}