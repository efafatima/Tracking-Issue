import { Sparkles } from "lucide-react";

export default function AIPanel({ suggestions, category, severity }) {
  return (
    <div className="ai-panel">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span className="ai-badge">
          <Sparkles size={14} />
          AI Assistant
        </span>
      </div>
      
      <div style={{ display: "grid", gap: 12 }}>
        {category && (
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>
              Suggested Category
            </div>
            <div style={{ fontSize: "0.95rem", color: "#534AB7", fontWeight: 600 }}>
              {category}
            </div>
          </div>
        )}
        
        {severity && (
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>
              Severity Level
            </div>
            <div style={{ 
              display: "inline-flex",
              padding: "4px 10px",
              borderRadius: 999,
              background: severity === "High" || severity === "Urgent" ? "#ffe8e8" : severity === "Medium" ? "#fef3e8" : "#e8f5f0",
              color: severity === "High" || severity === "Urgent" ? "#A32D2D" : severity === "Medium" ? "#BA7517" : "#1D9E75",
              fontWeight: 600,
              fontSize: "0.85rem"
            }}>
              {severity}
            </div>
          </div>
        )}
        
        {suggestions && suggestions.length > 0 && (
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>
              Similar Issues Found
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {suggestions.map((suggestion, i) => (
                <div 
                  key={i}
                  style={{
                    fontSize: "0.8rem",
                    padding: "8px",
                    background: "rgba(255, 255, 255, 0.5)",
                    borderRadius: 6,
                    color: "#0F172A",
                    border: "1px solid rgba(15, 23, 42, 0.1)"
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
