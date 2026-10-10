import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "VoteHub <onboarding@resend.dev>";
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0].trim();

let resend = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

function layout(title, bodyHtml) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #101014;">
    <div style="background: #0c0c0e; padding: 24px 28px; border-radius: 8px 8px 0 0;">
      <div style="color: #ffffff; font-size: 20px; font-weight: bold;">VoteHub</div>
    </div>
    <div style="border: 1px solid #e7e7e3; border-top: none; padding: 28px; border-radius: 0 0 8px 8px;">
      <h1 style="font-size: 20px; margin: 0 0 12px;">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="font-size: 12px; color: #5d5d63; text-align: center; margin-top: 16px;">
      You're receiving this because you were invited to a VoteHub poll.
    </p>
  </div>`;
}

function inviteBody({ pollTitle, question, reference, pin, organizerName, joinUrl, registered }) {
  const pinRow = pin
    ? `<p style="margin: 6px 0;"><strong>Voting PIN:</strong> ${pin}</p>`
    : "";
  const registerCta = registered
    ? ""
    : `<p style="margin: 18px 0 6px;">You don't have a VoteHub account yet. Create one to keep track of your polls:</p>
       <p style="margin: 6px 0;"><a href="${FRONTEND_URL}/signup" style="display: inline-block; background: #101014; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">Create a free account</a></p>
       <p style="font-size: 13px; color: #5d5d63;">You can still vote with just your email — no account required.</p>`;
  return `
    <p style="margin: 0 0 8px;"><strong>${organizerName}</strong> invited you to vote in:</p>
    <p style="font-size: 17px; font-weight: bold; margin: 0 0 4px;">${pollTitle}</p>
    <p style="color: #5d5d63; margin: 0 0 12px;">${question}</p>
    <p style="margin: 6px 0;"><strong>Poll reference:</strong> ${reference}</p>
    ${pinRow}
    <p style="margin: 18px 0 6px;"><a href="${joinUrl}" style="display: inline-block; background: #e8492b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">Join the poll</a></p>
    ${registerCta}`;
}

/**
 * Sends one email. If Resend isn't configured, logs and skips so that
 * poll creation never breaks because email isn't set up.
 */
export async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.log(`[email:skipped] to=${to} subject="${subject}" (RESEND_API_KEY not set)`);
    return { skipped: true };
  }
  try {
    const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
    if (error) throw error;
    return { sent: true };
  } catch (err) {
    console.error(`[email:failed] to=${to}:`, err?.message || err);
    return { failed: true };
  }
}

export function pollInviteEmail({ to, pollTitle, question, reference, pin, organizerName, registered }) {
  const joinUrl = `${FRONTEND_URL}/join-poll?ref=${encodeURIComponent(reference)}`;
  return sendEmail({
    to,
    subject: `You've been invited to vote: ${pollTitle}`,
    html: layout(
      "You're invited to vote",
      inviteBody({ pollTitle, question, reference, pin, organizerName, joinUrl, registered })
    ),
  });
}
