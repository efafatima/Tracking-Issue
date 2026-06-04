"use client";

import { Bot, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function summarizeComplaint(complaint) {
  return {
    id: complaint.id,
    title: complaint.title || `Complaint ${complaint.id}`,
    status: complaint.status,
    assigned: complaint.assigned_teacher?.username || "",
    updated: complaint.updated_at || complaint.created_at || ""
  };
}

function makeStorageKey(profile, suffix) {
  return `issue-tracker:${profile?.id || "guest"}:${suffix}`;
}

export default function VoiceRobot({ profile, complaints = [], notifications = [], lastCreatedComplaint }) {
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [position, setPosition] = useState(null);
  const mountedRef = useRef(false);
  const robotRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);

  const complaintSnapshots = useMemo(() => complaints.map(summarizeComplaint), [complaints]);

  function speak(text) {
    setMessage(text);
    if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.08;
    utterance.volume = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    if (!profile) return;
    const saved = localStorage.getItem(makeStorageKey(profile, "voice-enabled"));
    if (saved !== null) setEnabled(saved === "true");
    const savedPosition = localStorage.getItem(makeStorageKey(profile, "voice-position"));
    if (savedPosition) setPosition(JSON.parse(savedPosition));
  }, [profile]);

  useEffect(() => {
    if (!profile || !lastCreatedComplaint) return;
    speak(`Your complaint ${lastCreatedComplaint.title} has been submitted successfully.`);
  }, [lastCreatedComplaint?.id]);

  useEffect(() => {
    if (!profile) return;
    const key = makeStorageKey(profile, "complaint-statuses");
    const previous = JSON.parse(localStorage.getItem(key) || "{}");
    const next = {};
    const statusMessages = [];

    for (const complaint of complaintSnapshots) {
      next[complaint.id] = {
        title: complaint.title,
        status: complaint.status,
        assigned: complaint.assigned,
        updated: complaint.updated
      };

      const old = previous[complaint.id];
      if (!old) continue;
      if (old.status && old.status !== complaint.status) {
        statusMessages.push(`${complaint.title} is now ${complaint.status}.`);
      } else if (profile.role === "Faculty Member" && !old.assigned && complaint.assigned) {
        statusMessages.push(`New task assigned. ${complaint.title} is assigned to you.`);
      }
    }

    localStorage.setItem(key, JSON.stringify(next));
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    if (statusMessages.length) speak(statusMessages[0]);
  }, [profile, complaintSnapshots]);

  useEffect(() => {
    if (!profile || !notifications.length) return;
    const key = makeStorageKey(profile, "notification-ids");
    const previous = new Set(JSON.parse(localStorage.getItem(key) || "[]"));
    const currentIds = notifications.map((item) => item.id);
    const newest = notifications.find((item) => !previous.has(item.id));
    localStorage.setItem(key, JSON.stringify(currentIds));

    if (!mountedRef.current || !newest) return;
    if (profile.role !== "Student") speak(newest.message);
  }, [profile, notifications]);

  function toggleVoice() {
    const next = !enabled;
    setEnabled(next);
    if (profile) localStorage.setItem(makeStorageKey(profile, "voice-enabled"), String(next));
    if (!next && typeof window !== "undefined") window.speechSynthesis?.cancel();
  }

  function startDrag(event) {
    if (!robotRef.current) return;
    const rect = robotRef.current.getBoundingClientRect();
    dragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      moved: false
    };
    robotRef.current.setPointerCapture?.(event.pointerId);
  }

  function moveDrag(event) {
    if (!dragRef.current || !robotRef.current) return;
    const rect = robotRef.current.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - rect.width - 8, event.clientX - dragRef.current.offsetX));
    const top = Math.max(8, Math.min(window.innerHeight - rect.height - 8, event.clientY - dragRef.current.offsetY));
    dragRef.current.moved = true;
    const nextPosition = { left, top };
    setPosition(nextPosition);
    if (profile) localStorage.setItem(makeStorageKey(profile, "voice-position"), JSON.stringify(nextPosition));
  }

  function endDrag(event) {
    if (dragRef.current?.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    robotRef.current?.releasePointerCapture?.(event.pointerId);
    dragRef.current = null;
  }

  return (
    <div
      ref={robotRef}
      className={`voice-robot ${speaking ? "is-speaking" : ""}`}
      style={position ? { left: position.left, top: position.top, bottom: "auto" } : undefined}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <button className="robot-body" type="button" onClick={() => !suppressClickRef.current && message && speak(message)} title={message || "IssueTracker voice assistant"}>
        <Bot size={25} />
        <span className="robot-dot" />
      </button>
      <button className="robot-sound" type="button" onClick={() => !suppressClickRef.current && toggleVoice()} aria-label={enabled ? "Mute robot" : "Unmute robot"}>
        {enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
      </button>
      {message && <div className="robot-bubble">{message}</div>}
    </div>
  );
}
