"use client";

import { useEffect } from "react";

const botId = process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID;
const clientId = process.env.NEXT_PUBLIC_BOTPRESS_CLIENT_ID;
const scriptUrl = process.env.NEXT_PUBLIC_BOTPRESS_SCRIPT_URL || "https://cdn.botpress.cloud/webchat/v3.6/inject.js";

const BOT_CONTEXT = `
You are IssueTracker Student Help Assistant for a university complaint system.
Help students understand:
- how to submit a complaint from Student Dashboard
- what title, description, category, priority, and anonymous submission mean
- how routed roles work: HOD, DSA, Supervisor
- statuses: Submitted, In Progress, Resolved, Closed, Rejected
- how faculty assignment works
- where to check complaint status and notifications
- when email alerts are sent
- how rating/feedback works after resolution
If a student asks for live complaint data, ask them to check Dashboard > Complaints because you cannot access private records.
Keep answers short, polite, and practical.
`;

export default function StudentBotpressChat({ profile }) {
  useEffect(() => {
    if (!botId || !clientId) {
      console.info("Botpress disabled: set NEXT_PUBLIC_BOTPRESS_BOT_ID and NEXT_PUBLIC_BOTPRESS_CLIENT_ID.");
      return;
    }

    if (!document.getElementById("botpress-responsive-styles")) {
      const style = document.createElement("style");
      style.id = "botpress-responsive-styles";
      style.textContent = `
        .bpFab, #bp-web-widget-container .bpw-floating-button {
          right: auto !important;
          left: 18px !important;
          bottom: 92px !important;
          width: 54px !important;
          height: 54px !important;
          border-radius: 999px !important;
          box-shadow: 0 16px 34px rgba(37,99,235,.26) !important;
          z-index: 80 !important;
        }
        .bpWebchat, #bp-web-widget-container .bpw-layout {
          right: auto !important;
          left: 18px !important;
          bottom: 154px !important;
          max-width: min(390px, calc(100vw - 24px)) !important;
          max-height: min(680px, calc(100svh - 190px)) !important;
          border-radius: 8px !important;
        }
        @media (max-width: 560px) {
          .bpFab, #bp-web-widget-container .bpw-floating-button {
            left: 12px !important;
            bottom: 82px !important;
            width: 48px !important;
            height: 48px !important;
          }
          .bpWebchat, #bp-web-widget-container .bpw-layout {
            left: 10px !important;
            right: 10px !important;
            bottom: 138px !important;
            width: calc(100vw - 20px) !important;
            max-height: calc(100svh - 156px) !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    function initBotpress() {
      if (!window.botpress?.init || window.__issueTrackerBotpressReady) return;

      window.botpress.init({
        botId,
        clientId,
        userData: {
          name: profile?.username || "Student",
          role: profile?.role || "Student"
        },
        configuration: {
          botName: "IssueTracker Help",
          botDescription: "Ask me how to submit and track complaints"
        }
      });

      window.__issueTrackerBotpressReady = true;
      window.botpress.sendEvent?.({
        type: "proactive-trigger",
        channel: "web",
        payload: {
          text: BOT_CONTEXT
        }
      });
    }

    if (window.botpress?.init) {
      initBotpress();
      return;
    }

    const existing = document.getElementById("botpress-webchat-script");
    if (existing) {
      existing.addEventListener("load", initBotpress, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "botpress-webchat-script";
    script.src = scriptUrl;
    script.async = true;
    script.onload = initBotpress;
    script.onerror = () => console.error("Botpress webchat script failed to load.");
    document.body.appendChild(script);
  }, [profile]);

  return null;
}
