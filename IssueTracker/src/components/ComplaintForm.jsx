"use client";

import { useState } from "react";
import { Paperclip, Send, Sparkles } from "lucide-react";
import { api, supabase } from "@/lib/clientApi";
import AIPanel from "./AIPanel";

const categories = ["Academic", "Administrative", "Facilities", "Behavior-related", "Other"];
const priorities = ["Low", "Medium", "High", "Urgent"];

export default function ComplaintForm({ onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", category: "Other", priority: "Medium", is_anonymous: false });
  const [files, setFiles] = useState([]);
  const [suggestion, setSuggestion] = useState(null);
  const [busy, setBusy] = useState(false);

  async function suggest() {
    if (!form.description.trim()) return;
    const data = await api("/api/complaints/suggest", { method: "POST", body: JSON.stringify({ description: form.description }) });
    setSuggestion(data);
    setForm((prev) => ({ ...prev, category: data.suggested_category, priority: data.suggested_priority }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const data = await api("/api/complaints", { method: "POST", body: JSON.stringify(form) });
    for (const file of files) {
      const path = `${data.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("complaint-attachments").upload(path, file, { upsert: false });
      if (!error) {
        const { data: publicUrl } = supabase.storage.from("complaint-attachments").getPublicUrl(path);
        await api(`/api/complaints/${data.id}/attachments`, {
          method: "POST",
          body: JSON.stringify({ file_path: path, file_url: publicUrl.publicUrl, file_type: file.type })
        });
      }
    }
    setBusy(false);
    setForm({ title: "", description: "", category: "Other", priority: "Medium", is_anonymous: false });
    setSuggestion(null);
    setFiles([]);
    onCreated(data);
  }

  return (
    <section className="section">
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0, color: "#0F172A" }}>Submit Complaint</h2>
          <p className="muted" style={{ marginTop: 4 }}>Get AI suggestions for category, severity, and check for duplicates.</p>
        </div>
        <button className="btn secondary" type="button" onClick={suggest}><Sparkles size={16} /> Get Suggestions</button>
      </div>
      
      <form className="form" style={{ marginTop: 14 }} onSubmit={submit}>
        <input className="input" placeholder="Complaint title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="input" placeholder="Describe the issue in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        
        {suggestion && (
          <AIPanel 
            category={suggestion.suggested_category}
            severity={suggestion.suggested_priority}
            suggestions={suggestion.similar_issues ? suggestion.similar_issues.slice(0, 3) : []}
          />
        )}
        
        <div className="responsive-two">
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {priorities.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        
        <label className="muted" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={form.is_anonymous} onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })} />
          <span>Submit anonymously</span>
        </label>
        
        <label className="input" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <Paperclip size={16} />
          <span className="muted">{files.length ? `${files.length} attachment${files.length !== 1 ? 's' : ''} selected` : "Add attachments"}</span>
          <input style={{ display: "none" }} type="file" multiple onChange={(e) => setFiles([...e.target.files])} />
        </label>
        
        <button className="btn" disabled={busy} style={{ background: "var(--primary)", width: "100%" }}>
          <Send size={16} /> {busy ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </section>
  );
}
