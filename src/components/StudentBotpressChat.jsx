"use client";

import { useEffect } from "react";

const botId = process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID;
const clientId = process.env.NEXT_PUBLIC_BOTPRESS_CLIENT_ID;
const scriptUrl = process.env.NEXT_PUBLIC_BOTPRESS_SCRIPT_URL || "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
const configScriptUrl = process.env.NEXT_PUBLIC_BOTPRESS_CONFIG_URL;

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

function removeBotpressWidget() {
  if (typeof document === "undefined") return;

  window.botpress?.close?.();

  [
    "#botpress-webchat-script",
    "#botpress-config-script",
    "#botpress-webchat",
    "#bp-web-widget-container",
    ".bpFab",
    ".bpWebchat",
    ".bp-widget-web",
    "iframe[src*='botpress']"
  ].forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => element.remove());
  });

  window.__issueTrackerBotpressReady = false;
}

export default function StudentBotpressChat({ profile }) {
  useEffect(() => {
    if (profile?.role !== "Student") {
      removeBotpressWidget();
      return;
    }

    const hasConfigEmbed = Boolean(configScriptUrl);
    const hasManualConfig = Boolean(botId && clientId);

    if (!hasConfigEmbed && !hasManualConfig) {
      console.info("Botpress disabled: set NEXT_PUBLIC_BOTPRESS_CONFIG_URL or NEXT_PUBLIC_BOTPRESS_BOT_ID/NEXT_PUBLIC_BOTPRESS_CLIENT_ID.");
      return;
    }

    if (!document.getElementById("botpress-responsive-styles")) {
      const style = document.createElement("style");
      style.id = "botpress-responsive-styles";
      style.textContent = `
        .bpFab, #bp-web-widget-container .bpw-floating-button {
          right: 18px !important;
          bottom: 18px !important;
          width: 54px !important;
          height: 54px !important;
          border-radius: 999px !important;
          box-shadow: 0 16px 34px rgba(37,99,235,.26) !important;
          z-index: 86 !important;
          cursor: grab !important;
          touch-action: none !important;
        }
        .bpWebchat, #bp-web-widget-container .bpw-layout {
          right: 18px !important;
          bottom: 86px !important;
          max-width: min(390px, calc(100vw - 24px)) !important;
          max-height: min(680px, calc(100svh - 110px)) !important;
          border-radius: 8px !important;
        }
        @media (max-width: 560px) {
          .bpFab, #bp-web-widget-container .bpw-floating-button {
            right: 12px !important;
            bottom: 12px !important;
            width: 48px !important;
            height: 48px !important;
          }
          .bpWebchat, #bp-web-widget-container .bpw-layout {
            left: 10px !important;
            right: 10px !important;
            bottom: 72px !important;
            width: calc(100vw - 20px) !important;
            max-height: calc(100svh - 92px) !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    function makeBotpressFabDraggable() {
      const fab = document.querySelector(".bpFab, #bp-web-widget-container .bpw-floating-button");
      if (!fab || fab.dataset.issueTrackerDraggable === "true") return;

      fab.dataset.issueTrackerDraggable = "true";
      const savedPosition = localStorage.getItem("issue-tracker:botpress-position");
      if (savedPosition) {
        try {
          const { left, top } = JSON.parse(savedPosition);
          Object.assign(fab.style, {
            left: `${left}px`,
            top: `${top}px`,
            right: "auto",
            bottom: "auto",
            position: "fixed"
          });
        } catch {
          localStorage.removeItem("issue-tracker:botpress-position");
        }
      }

      let drag = null;
      let suppressClick = false;
      fab.addEventListener("pointerdown", (event) => {
        const rect = fab.getBoundingClientRect();
        drag = {
          offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top,
          moved: false
        };
        fab.setPointerCapture?.(event.pointerId);
        fab.style.cursor = "grabbing";
      });
      fab.addEventListener("pointermove", (event) => {
        if (!drag) return;
        const rect = fab.getBoundingClientRect();
        const left = Math.max(8, Math.min(window.innerWidth - rect.width - 8, event.clientX - drag.offsetX));
        const top = Math.max(8, Math.min(window.innerHeight - rect.height - 8, event.clientY - drag.offsetY));
        drag.moved = true;
        Object.assign(fab.style, {
          left: `${left}px`,
          top: `${top}px`,
          right: "auto",
          bottom: "auto",
          position: "fixed"
        });
        localStorage.setItem("issue-tracker:botpress-position", JSON.stringify({ left, top }));
      });
      fab.addEventListener("pointerup", (event) => {
        if (drag?.moved) {
          suppressClick = true;
          window.setTimeout(() => {
            suppressClick = false;
          }, 0);
        }
        fab.releasePointerCapture?.(event.pointerId);
        fab.style.cursor = "grab";
        drag = null;
      });
      fab.addEventListener("pointercancel", () => {
        fab.style.cursor = "grab";
        drag = null;
      });
      fab.addEventListener("click", (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
      }, true);
    }

    function initManualBotpress() {
      if (!window.botpress?.init || window.__issueTrackerBotpressReady || !hasManualConfig) return;

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
      setTimeout(makeBotpressFabDraggable, 700);
    }

    function loadConfigScript() {
      if (!hasConfigEmbed) {
        initManualBotpress();
        return;
      }
      if (document.getElementById("botpress-config-script")) return;

      const configScript = document.createElement("script");
      configScript.id = "botpress-config-script";
      configScript.src = configScriptUrl;
      configScript.defer = true;
      configScript.onerror = () => console.error("Botpress config script failed to load.");
      document.body.appendChild(configScript);
      window.__issueTrackerBotpressReady = true;
      setTimeout(makeBotpressFabDraggable, 900);
    }

    if (window.botpress?.init) {
      loadConfigScript();
      return;
    }

    const existing = document.getElementById("botpress-webchat-script");
    if (existing) {
      existing.addEventListener("load", loadConfigScript, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "botpress-webchat-script";
    script.src = scriptUrl;
    script.async = true;
    script.onload = loadConfigScript;
    script.onerror = () => console.error("Botpress webchat script failed to load.");
    document.body.appendChild(script);
    const draggableTimer = window.setInterval(makeBotpressFabDraggable, 1200);
    return () => {
      window.clearInterval(draggableTimer);
      removeBotpressWidget();
    };
  }, [profile?.role, profile?.username]);

  return null;
}
