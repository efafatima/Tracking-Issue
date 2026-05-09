import { motion } from "framer-motion";
import React from "react";

export default function FloatingParticle({ x, y, size, duration, delay }) {
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
