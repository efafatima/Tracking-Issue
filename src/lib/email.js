import tls from "node:tls";

const appName = process.env.EMAIL_APP_NAME || "IssueTracker";
const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "";
const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_APP_PASSWORD;
const fromEmail = process.env.EMAIL_FROM || (gmailUser ? `${appName} <${gmailUser}>` : "");
const replyTo = process.env.EMAIL_REPLY_TO || undefined;
const dryRun = process.env.EMAIL_DRY_RUN === "true" || !gmailUser || !gmailAppPassword;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("SMTP response timed out"));
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);
      socket.off("data", onData);
      socket.off("error", onError);
    }

    function onError(error) {
      cleanup();
      reject(error);
    }

    function onData(chunk) {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines.at(-1);
      if (last && /^\d{3} /.test(last)) {
        cleanup();
        resolve(buffer);
      }
    }

    socket.on("data", onData);
    socket.on("error", onError);
  });
}

async function smtpCommand(socket, command, expectedCodes = ["250"]) {
  socket.write(`${command}\r\n`);
  const response = await readResponse(socket);
  const code = response.slice(0, 3);
  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP command failed (${command}): ${response.trim()}`);
  }
  return response;
}

function dotStuff(message) {
  return message.replace(/^\./gm, "..");
}

function encodeHeader(value = "") {
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

async function sendGmailSmtp({ to, subject, html, text }) {
  const socket = tls.connect({
    host: "smtp.gmail.com",
    port: 465,
    servername: "smtp.gmail.com"
  });

  try {
    await readResponse(socket);
    await smtpCommand(socket, "EHLO issuetracker.local", ["250"]);
    await smtpCommand(socket, "AUTH LOGIN", ["334"]);
    await smtpCommand(socket, Buffer.from(gmailUser).toString("base64"), ["334"]);
    await smtpCommand(socket, Buffer.from(gmailAppPassword).toString("base64"), ["235"]);
    await smtpCommand(socket, `MAIL FROM:<${gmailUser}>`, ["250"]);
    for (const recipient of to) {
      await smtpCommand(socket, `RCPT TO:<${recipient}>`, ["250", "251"]);
    }
    await smtpCommand(socket, "DATA", ["354"]);

    const boundary = `issuetracker-${Date.now()}`;
    const message = [
      `From: ${encodeHeader(fromEmail || gmailUser)}`,
      `To: ${to.map(encodeHeader).join(", ")}`,
      `Subject: ${encodeHeader(subject)}`,
      replyTo ? `Reply-To: ${encodeHeader(replyTo)}` : null,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 7bit",
      "",
      text,
      "",
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: 7bit",
      "",
      html,
      "",
      `--${boundary}--`
    ].filter((line) => line !== null).join("\r\n");

    socket.write(`${dotStuff(message)}\r\n.\r\n`);
    const dataResponse = await readResponse(socket);
    if (!dataResponse.startsWith("250")) {
      throw new Error(`SMTP DATA failed: ${dataResponse.trim()}`);
    }
    await smtpCommand(socket, "QUIT", ["221"]);
  } finally {
    socket.end();
  }
}

function uniqueRecipients(recipients = []) {
  const seen = new Set();
  return recipients
    .filter((recipient) => recipient?.email)
    .map((recipient) => ({ ...recipient, email: recipient.email.trim().toLowerCase() }))
    .filter((recipient) => {
      if (!recipient.email || seen.has(recipient.email)) return false;
      seen.add(recipient.email);
      return true;
    });
}

function baseTemplate({ title, intro, rows = [], actionLabel, actionUrl }) {
  const detailRows = rows
    .filter(([label, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 0;color:#64748b;font-weight:700;width:130px;">${escapeHtml(label)}</td>
        <td style="padding:8px 0;color:#0f172a;">${escapeHtml(value)}</td>
      </tr>
    `)
    .join("");

  const action = actionUrl ? `
    <p style="margin:22px 0 0;">
      <a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:800;">
        ${escapeHtml(actionLabel || "Open dashboard")}
      </a>
    </p>
  ` : "";

  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#f5f7fb;padding:24px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;">
        <h1 style="margin:0 0 10px;color:#0f172a;font-size:22px;">${escapeHtml(title)}</h1>
        <p style="margin:0 0 18px;color:#334155;line-height:1.6;">${escapeHtml(intro)}</p>
        <table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
          ${detailRows}
        </table>
        ${action}
        <p style="margin:22px 0 0;color:#94a3b8;font-size:12px;">This is an automated message from ${escapeHtml(appName)}.</p>
      </div>
    </div>
  `;
}

function textTemplate({ title, intro, rows = [], actionUrl }) {
  const details = rows
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
  return [title, intro, details, actionUrl ? `Open dashboard: ${actionUrl}` : ""].filter(Boolean).join("\n\n");
}

export async function getRoleRecipients(supabase, { role, departmentId }) {
  let query = supabase.from("profiles").select("id,username,email,role,department_id").eq("role", role).eq("is_active", true);
  if (role !== "Supervisor" && departmentId) query = query.eq("department_id", departmentId);
  const { data, error } = await query;
  if (error) {
    console.error("Could not load email recipients:", error.message);
    return [];
  }
  return uniqueRecipients(data || []);
}

export async function sendEmail({ to, subject, title, intro, rows, actionLabel, actionPath }) {
  const recipients = uniqueRecipients(Array.isArray(to) ? to : [to]);
  if (!recipients.length) {
    console.info("Email skipped: no recipients", { subject, title });
    return { sent: 0, skipped: true };
  }

  const actionUrl = appUrl && actionPath ? `${appUrl.replace(/\/$/, "")}${actionPath}` : appUrl;
  const html = baseTemplate({ title, intro, rows, actionLabel, actionUrl });
  const text = textTemplate({ title, intro, rows, actionUrl });

  if (dryRun) {
    console.info("Email dry run:", {
      to: recipients.map((recipient) => recipient.email),
      subject,
      title
    });
    return { sent: 0, dryRun: true };
  }

  console.info("Sending Gmail email:", {
    to: recipients.map((recipient) => recipient.email),
    subject,
    title
  });
  await sendGmailSmtp({
    to: recipients.map((recipient) => recipient.email),
    subject,
    html,
    text
  });
  console.info("Gmail email sent:", {
    to: recipients.map((recipient) => recipient.email),
    subject
  });

  return { sent: recipients.length };
}

export async function sendEmailSafely(payload) {
  try {
    return await sendEmail(payload);
  } catch (error) {
    console.error("Email send failed:", error.message);
    return { sent: 0, error: error.message };
  }
}
