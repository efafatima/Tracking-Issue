import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { fadeUp } from "./helpers";
import { getComplaintSuggestion } from "../../services/api";

const CATEGORIES = ["Academic", "Administrative", "Facilities", "Behavior-related", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const ACCEPTED = ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ComplaintForm({ onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    details: "",
    category: "",
    priority: "",
    attachments: [],
    anonymous: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState("");
  const [result, setResult] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const text = form.details.trim();
    if (text.length < 25) {
      setSuggestion(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSuggestion(await getComplaintSuggestion(text));
      } catch {
        setSuggestion(null);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [form.details]);

  const inputStyle = (field) => ({
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    outline: "none",
    border: focused === field ? "1px solid #5b9af5" : "1px solid #e2e8f0",
    boxShadow: focused === field ? "0 0 0 3px rgba(91,154,245,0.12)" : "none",
    fontSize: 13.5,
    color: "#1e293b",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: focused === field ? "#fff" : "#f8faff",
    transition: "border 0.15s, box-shadow 0.15s, background 0.15s",
  });

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const tooLarge = files.find((file) => file.size > MAX_FILE_SIZE);
    if (tooLarge) {
      setError(`${tooLarge.name} exceeds the 10MB limit.`);
      return;
    }
    setError("");
    setForm((f) => ({ ...f, attachments: files }));
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    setForm((f) => ({
      ...f,
      category: CATEGORIES.includes(suggestion.suggested_category) ? suggestion.suggested_category : f.category,
      priority: PRIORITIES.includes(suggestion.suggested_priority) ? suggestion.suggested_priority : f.priority,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Complaint title is required.");
    if (!form.details.trim()) return setError("Complaint description is required.");
    if (!form.category) return setError("Please select a category.");
    if (!form.priority) return setError("Please select a priority.");

    const res = await onSubmit(form);
    setResult(res);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ title: "", details: "", category: "", priority: "", attachments: [], anonymous: false });
    }, 1800);
  };

  const fieldLabel = (text) => (
    <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>
      {text}
    </p>
  );

  return (
    <motion.div
      {...fadeUp(0.05)}
      style={{
        background: "white",
        borderRadius: 18,
        padding: "26px 26px 22px",
        boxShadow: "0 4px 28px rgba(61,114,224,0.08)",
        border: "1px solid rgba(91,154,245,0.12)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid #f1f5f9" }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: "linear-gradient(135deg,#5b9af5,#3d72e0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>Submit a Complaint</h2>
          <p style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 500 }}>Category and priority are your final choices</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12.5,
            color: "#b91c1c",
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          {fieldLabel("Title *")}
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Brief complaint title"
            onFocus={() => setFocused("title")}
            onBlur={() => setFocused("")}
            style={inputStyle("title")}
          />
        </div>

        {/* Description */}
        <div>
          {fieldLabel("Description *")}
          <textarea
            value={form.details}
            onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
            placeholder="Describe your issue in detail..."
            rows={4}
            onFocus={() => setFocused("details")}
            onBlur={() => setFocused("")}
            style={{ ...inputStyle("details"), resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        {/* ML Suggestion */}
        {suggestion && (
          <div style={{
            border: "1px solid rgba(91,154,245,0.25)",
            background: "rgba(91,154,245,0.06)",
            borderRadius: 11,
            padding: "11px 14px",
            display: "flex",
            gap: 10,
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}>
            <div style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>
              ML suggestion:{" "}
              <span style={{ color: "#3d72e0" }}>{suggestion.suggested_category || "N/A"}</span>
              {" / "}
              <span style={{ color: "#3d72e0" }}>{suggestion.suggested_priority || "N/A"}</span>
              {suggestion.similarity_score
                ? <span style={{ color: "#94a3b8", fontWeight: 500 }}>, {(suggestion.similarity_score * 100).toFixed(1)}% match</span>
                : ""}
            </div>
            <button
              type="button"
              onClick={applySuggestion}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid rgba(91,154,245,0.4)",
                background: "transparent",
                color: "#3d72e0",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Apply suggestion
            </button>
          </div>
        )}

        {/* Category + Priority */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            {fieldLabel("Category *")}
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              onFocus={() => setFocused("category")}
              onBlur={() => setFocused("")}
              style={{ ...inputStyle("category"), cursor: "pointer" }}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            {fieldLabel("Priority *")}
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              onFocus={() => setFocused("priority")}
              onBlur={() => setFocused("")}
              style={{ ...inputStyle("priority"), cursor: "pointer" }}
            >
              <option value="">Select priority</option>
              {PRIORITIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        {/* File Upload */}
        <div>
          {fieldLabel("Attachments")}
          <label style={{
            display: "block",
            border: "1.5px dashed #cbd5e1",
            borderRadius: 10,
            padding: "14px",
            textAlign: "center",
            cursor: "pointer",
            background: "#f8faff",
            transition: "border-color 0.15s",
          }}>
            <input type="file" multiple accept={ACCEPTED} onChange={handleFiles} style={{ display: "none" }} />
            <div style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 500 }}>
              Drop files here or{" "}
              <span style={{ color: "#5b9af5", fontWeight: 700 }}>browse</span>
            </div>
            <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 3 }}>
              JPG, PNG, PDF, DOC, TXT — max 10MB each
            </div>
          </label>
          {form.attachments.length > 0 && (
            <p style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600, marginTop: 6 }}>
              {form.attachments.length} file(s) selected
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#f1f5f9" }} />

        {/* Anonymous + Submit row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.anonymous}
              onChange={(e) => setForm((f) => ({ ...f, anonymous: e.target.checked }))}
              style={{ accentColor: "#5b9af5", width: 15, height: 15 }}
            />
            Submit anonymously
          </label>
          <span style={{ fontSize: 11, color: "#cbd5e1" }}>* required fields</span>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          style={{
            height: 48,
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            background: submitted
              ? "linear-gradient(90deg,#22c55e,#16a34a)"
              : "linear-gradient(90deg,#5b9af5,#3d72e0)",
            color: "white",
            fontWeight: 800,
            fontSize: 14,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background 0.3s",
          }}
        >
          {!submitted && (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
          <AnimatePresence mode="wait">
            {submitted
              ? <motion.span key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ Complaint Submitted</motion.span>
              : <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Submit Complaint</motion.span>
            }
          </AnimatePresence>
        </motion.button>

        {/* Result */}
        {result && (
          <div style={{
            borderRadius: 11,
            padding: "11px 14px",
            background: "rgba(34,197,94,0.07)",
            border: "1px solid rgba(34,197,94,0.25)",
            fontSize: 12.5,
            color: "#166534",
            fontWeight: 700,
          }}>
            Saved #{result.id}: {result.category} / {result.priority}. Routed to {result.routed_to_role}.
          </div>
        )}
      </form>
    </motion.div>
  );
}