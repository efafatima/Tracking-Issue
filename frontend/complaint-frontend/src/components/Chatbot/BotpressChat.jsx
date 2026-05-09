import { useEffect } from "react";

const BOT_STYLES = `
  /* ── Launcher button ── */
  #bp-web-widget-container .bpw-floating-button,
  .bpFab {
    background: linear-gradient(135deg, #3d72e0 0%, #5b9af5 100%) !important;
    box-shadow: 0 4px 20px rgba(61,114,224,0.45) !important;
    border: none !important;
    width: 54px !important;
    height: 54px !important;
    border-radius: 50% !important;
    z-index: 999999 !important;
  }

  /* ── Chat window wrapper ── */
  #bp-web-widget-container .bpw-layout,
  .bpWebchat {
    border-radius: 16px !important;
    overflow: hidden !important;
    box-shadow: 0 20px 60px rgba(15,23,42,0.22), 0 4px 20px rgba(61,114,224,0.15) !important;
    border: 1px solid rgba(91,154,245,0.18) !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }

  /* ── Header ── */
  #bp-web-widget-container .bpw-header-container,
  .bpHeaderBar {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a6e 100%) !important;
    border-bottom: 1px solid rgba(91,154,245,0.2) !important;
    padding: 14px 18px !important;
  }

  #bp-web-widget-container .bpw-header-title,
  .bpHeaderTitle {
    color: #ffffff !important;
    font-weight: 700 !important;
    font-size: 15px !important;
    letter-spacing: -0.01em !important;
  }

  #bp-web-widget-container .bpw-header-subtitle,
  .bpHeaderSubtitle {
    color: rgba(148,163,184,0.9) !important;
    font-size: 12px !important;
  }

  /* ── Message area background ── */
  #bp-web-widget-container .bpw-chat-container,
  .bpMessageList {
    background: #f8faff !important;
  }

  /* ── Bot messages ── */
  #bp-web-widget-container .bpw-from-bot .bpw-message-text,
  .bpBotMessage .bpMessageContent {
    background: #ffffff !important;
    color: #0f172a !important;
    border: 1px solid rgba(91,154,245,0.15) !important;
    border-radius: 12px 12px 12px 3px !important;
    box-shadow: 0 2px 8px rgba(15,23,42,0.06) !important;
    font-size: 13.5px !important;
    line-height: 1.55 !important;
  }

  /* ── User messages ── */
  #bp-web-widget-container .bpw-from-user .bpw-message-text,
  .bpUserMessage .bpMessageContent {
    background: linear-gradient(135deg, #3d72e0 0%, #5b9af5 100%) !important;
    color: #ffffff !important;
    border-radius: 12px 12px 3px 12px !important;
    box-shadow: 0 2px 10px rgba(61,114,224,0.3) !important;
    font-size: 13.5px !important;
    line-height: 1.55 !important;
    border: none !important;
  }

  /* ── Input area ── */
  #bp-web-widget-container .bpw-composer,
  .bpComposer {
    background: #ffffff !important;
    border-top: 1px solid rgba(91,154,245,0.15) !important;
    padding: 10px 14px !important;
  }

  #bp-web-widget-container .bpw-composer textarea,
  .bpComposerTextarea {
    background: #f1f5fd !important;
    border: 1.5px solid rgba(91,154,245,0.2) !important;
    border-radius: 10px !important;
    color: #0f172a !important;
    font-size: 13.5px !important;
    padding: 10px 14px !important;
    resize: none !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }

  #bp-web-widget-container .bpw-composer textarea:focus,
  .bpComposerTextarea:focus {
    border-color: #3d72e0 !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(61,114,224,0.1) !important;
  }

  /* ── Send button ── */
  #bp-web-widget-container .bpw-send-button,
  .bpSendButton {
    background: linear-gradient(135deg, #3d72e0, #5b9af5) !important;
    border-radius: 8px !important;
    border: none !important;
    color: white !important;
    padding: 8px 14px !important;
  }

  /* ── Quick reply / choice buttons ── */
  #bp-web-widget-container .bpw-keyboard-single-choice-btn,
  .bpChoiceButton {
    background: #ffffff !important;
    color: #3d72e0 !important;
    border: 1.5px solid rgba(61,114,224,0.35) !important;
    border-radius: 20px !important;
    font-size: 12.5px !important;
    font-weight: 600 !important;
    padding: 7px 16px !important;
    transition: all 0.2s !important;
  }

  #bp-web-widget-container .bpw-keyboard-single-choice-btn:hover,
  .bpChoiceButton:hover {
    background: linear-gradient(135deg, #3d72e0, #5b9af5) !important;
    color: #ffffff !important;
    border-color: transparent !important;
    box-shadow: 0 3px 12px rgba(61,114,224,0.3) !important;
  }

  /* ── Scrollbar ── */
  #bp-web-widget-container .bpw-chat-container::-webkit-scrollbar {
    width: 4px !important;
  }
  #bp-web-widget-container .bpw-chat-container::-webkit-scrollbar-thumb {
    background: rgba(91,154,245,0.25) !important;
    border-radius: 10px !important;
  }

  /* ── Timestamp ── */
  #bp-web-widget-container .bpw-message-date {
    color: #94a3b8 !important;
    font-size: 10.5px !important;
  }
`;

const SYSTEM_CONTEXT = `
You are the BZU Complaint System Assistant. Help students understand how the complaint system works.

=== COMPLAINT WORKFLOW ===
1. Student submits complaint (title + description). AI auto-assigns category & severity.
2. HOD reviews → Accepts or Rejects. If rejected, student is notified with reason.
3. Admin assigns an accepted complaint to a Teacher.
4. Teacher works on it → marks status: Under Review → In Progress → Solved.
5. Admin does final review → Finalizes (closes) or Rejects back to teacher.
6. Student gets email notifications at every step.

=== COMPLAINT STATUSES ===
- Pending: Just submitted, waiting for HOD review
- Under Review: HOD accepted, Admin assigning teacher
- In Progress: Teacher is working on it
- Solved: Teacher marked it solved, waiting for Admin to finalize
- Finalized: Complaint fully resolved and closed
- Rejected: HOD or Admin rejected the complaint

=== CATEGORIES (AI auto-assigned) ===
Academic, Administrative, Facilities, Financial, Faculty, IT Support, Library, Transport, Hostel, Other

=== SEVERITY LEVELS (AI auto-assigned) ===
Low, Medium, High, Critical — based on complaint content

=== KEY FEATURES ===
- Anonymous complaints: Student can hide their identity from teachers/admins
- Escalation: If no action in 3 days, HOD gets an automatic escalation email alert
- Rating: After complaint is finalized, student can rate the resolution (1–5 stars)
- Email notifications: Student receives email at every status change

=== HOW TO SUBMIT A COMPLAINT ===
1. Go to Student Dashboard
2. Click "Submit Complaint" button
3. Enter a clear Title (e.g. "Fee Challan Not Generated")
4. Write a detailed Description of your issue
5. Choose if you want to submit anonymously
6. Click Submit — AI will categorize and assign severity automatically

=== HOW TO CHECK COMPLAINT STATUS ===
1. Go to Student Dashboard
2. Look at "My Complaints" section or the complaints table
3. Each complaint shows its current status, assigned teacher, and timestamps

=== USER ROLES ===
- Student: Submit complaints, track status, rate resolution
- HOD (Head of Department): Review and accept/reject complaints
- Admin: Assign complaints to teachers, finalize resolved complaints
- Teacher: Work on assigned complaints, update status, add comments

=== TIPS FOR STUDENTS ===
- Write clear, specific titles — helps AI categorize correctly
- Include all relevant details in description (dates, roll number, course etc.)
- Check your email for updates — notifications are sent automatically
- If no action in 3 days, system auto-escalates to HOD
- You can submit multiple complaints for different issues

Answer all questions about this complaint system helpfully and in detail.
If a student asks about their specific complaint status or submission, tell them to check the Dashboard → My Complaints section.
`;

export default function BotpressChat() {
  useEffect(() => {
    // Inject custom styles
    if (!document.getElementById("bp-custom-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "bp-custom-styles";
      styleEl.textContent = BOT_STYLES;
      document.head.appendChild(styleEl);
    }

    const fullName = localStorage.getItem("full_name") || localStorage.getItem("username") || "Student";
    const initBotpress = () => {
      if (!window.botpress?.init) {
        console.error("Botpress script loaded but init() is not available.");
        return;
      }

      if (window.__bpInitialized) return;

      window.botpress.init({
        botId: "fea33256-670e-456a-97c9-f7c373035f15",
        clientId: "13580f68-034a-433d-8ab5-61b576f04f17",
        userData: {
          name: fullName,
        },
        configuration: {
          botName: "BZU Help Assistant",
          botDescription: "Ask me anything about the complaint system",
        },
      });

      window.__bpInitialized = true;
    };

    if (window.botpress?.init) {
      initBotpress();
      return;
    }

    const existingScript = document.getElementById("bp-script");
    if (existingScript) {
      existingScript.addEventListener("load", initBotpress, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "bp-script";
    script.src = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
    script.async = true;

    script.onload = initBotpress;
    script.onerror = () => {
      console.error("Failed to load Botpress CDN script.");
    };

    document.body.appendChild(script);
  }, []);

  return null;
}
