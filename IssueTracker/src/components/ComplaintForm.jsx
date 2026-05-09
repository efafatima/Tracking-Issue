"use client";

import { useState } from "react";
import { api, supabase } from "@/lib/clientApi";

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
          <h2 style={{ margin: 0 }}>Submit Complaint</h2>
          <p className="muted" style={{ marginTop: 4 }}>AI-assisted category, severity, and duplicate check.</p>
        </div>
        <button className="btn secondary" type="button" onClick={suggest}>Suggest</button>
      </div>
      {suggestion && (
        <div className="complaint-card" style={{ marginTop: 12 }}>
          Suggested: <strong>{suggestion.suggested_category}</strong> / <strong>{suggestion.suggested_priority}</strong>
          <span className="muted"> · {(suggestion.similarity_score * 100).toFixed(1)}% similar</span>
        </div>
      )}
      <form className="form" style={{ marginTop: 14 }} onSubmit={submit}>
        <input className="input" placeholder="Complaint title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="input" placeholder="Describe the issue" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {priorities.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <label className="muted"><input type="checkbox" checked={form.is_anonymous} onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })} /> Submit anonymously</label>
        <input className="input" type="file" multiple onChange={(e) => setFiles([...e.target.files])} />
        <button className="btn" disabled={busy}>{busy ? "Submitting..." : "Submit Complaint"}</button>
      </form>
    </section>
  );
}
