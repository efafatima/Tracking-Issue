import React, { useState } from "react";
import { motion } from "framer-motion";

export default function InputField({ placeholder, type = "text", icon, variants, value, onChange, onIconClick }) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div variants={variants} style={{ position: "relative" }}>
      {/* Left icon */}
      <div
        onClick={onIconClick || undefined}
        style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          fontSize: 14, opacity: focused ? 0.9 : 0.6,
          transition: "opacity 0.2s", zIndex: 2,
          pointerEvents: onIconClick ? "auto" : "none",
          cursor: onIconClick ? "pointer" : "default",
          userSelect: "none",
        }}
      >
        {icon}
      </div>

      <motion.input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        animate={{ scale: focused ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
        style={{
          width: "100%", paddingLeft: 42, paddingRight: 16,
          paddingTop: 13, paddingBottom: 13,
          fontSize: 13, color: "#1e293b",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: focused ? "#fff" : "rgba(248,250,255,0.8)",
          borderRadius: 12, outline: "none",
          border: focused ? "1.5px solid #5b9af5" : "1.5px solid #e2e8f0",
          boxShadow: focused
            ? "0 0 0 3.5px rgba(91,154,245,0.14), 0 2px 8px rgba(91,154,245,0.08)"
            : "0 1px 3px rgba(0,0,0,0.04)",
          transition: "all 0.2s",
        }}
      />

      <motion.div
        animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position: "absolute", bottom: 0, left: "10%",
          width: "80%", height: 2, borderRadius: 2,
          background: "linear-gradient(90deg,#5b9af5,#3d72e0)",
          transformOrigin: "center",
        }}
      />
    </motion.div>
  );
}
