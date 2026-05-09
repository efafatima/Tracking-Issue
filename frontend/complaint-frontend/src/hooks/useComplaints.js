import { useState, useEffect, useCallback } from "react";
import {
  getTeacherComplaints,
  addTeacherComment,
  updateComplaintStatus,
} from "../services/api";

export default function useComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeacherComplaints();
      // Backend returns array via unwrap(); guard for DRF pagination shape too
      setComplaints(Array.isArray(data) ? data : (data?.results ?? []));
    } catch (err) {
      console.error("useComplaints fetch error:", err.message);
      setError("Could not load complaints. Please refresh.");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  // ── Add / update comment ──────────────────────────────────────
  const addComment = useCallback(async (id, comment) => {
    try {
      await addTeacherComment(id, comment);
    } catch (err) {
      console.error("addComment error:", err.message);
    }
    // Optimistic local update regardless of API success
    setComplaints(prev =>
      prev.map(c => c.id === id ? { ...c, teacher_comments: comment } : c)
    );
  }, []);

  // ── Mark solved ───────────────────────────────────────────────
  const markSolved = useCallback(async (id) => {
    try {
      await updateComplaintStatus(id, "Solved");
    } catch (err) {
      console.error("markSolved error:", err.message);
    }
    setComplaints(prev =>
      prev.map(c => c.id === id ? { ...c, status: "Solved" } : c)
    );
  }, []);

  // ── Derived stats ─────────────────────────────────────────────
  const stats = {
    total:      complaints.length,
    inProgress: complaints.filter(c => c.status === "In Progress").length,
    solved:     complaints.filter(c => c.status === "Solved").length,
    pending:    complaints.filter(c => c.status === "Pending").length,
  };

  return { complaints, loading, error, stats, addComment, markSolved, refetch: fetchComplaints };
}
