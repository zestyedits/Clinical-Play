import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "clinicalplayapp@gmail.com";
const FROM_EMAIL = "ClinicalPlay <onboarding@resend.dev>";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function notifyAdminWaitlistSignup(email: string, name?: string | null) {
  try {
    const safeEmail = escapeHtml(email);
    const safeName = name ? escapeHtml(name) : null;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Waitlist Signup: ${safeEmail}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #f8f7f4;">
          <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e8e5de;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #1B2A4A; font-family: 'Lora', serif; margin: 0; font-size: 22px;">New Waitlist Signup</h2>
            </div>
            <div style="background: #f8f7f4; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
              <p style="margin: 0; color: #1B2A4A; font-size: 16px; font-weight: 600;">${safeEmail}</p>
              ${safeName ? `
              <p style="margin: 16px 0 8px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Name</p>
              <p style="margin: 0; color: #1B2A4A; font-size: 16px; font-weight: 600;">${safeName}</p>
              ` : ""}
            </div>
            <p style="color: #888; font-size: 13px; text-align: center; margin: 0;">
              Sent from ClinicalPlay Waitlist
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send waitlist notification email:", error);
  }
}

export async function notifyAdminSupportMessage(userEmail: string, subject: string, body: string) {
  try {
    const safeEmail = escapeHtml(userEmail);
    const safeSubject = escapeHtml(subject);
    const safeBody = escapeHtml(body);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Support Request from ${safeEmail}: ${safeSubject}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #f8f7f4;">
          <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e8e5de;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #1B2A4A; font-family: 'Lora', serif; margin: 0; font-size: 22px;">Support Request</h2>
            </div>
            <div style="background: #f8f7f4; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
              <p style="margin: 0 0 16px; color: #1B2A4A; font-size: 16px; font-weight: 600;">${safeEmail}</p>
              <p style="margin: 0 0 8px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
              <p style="margin: 0 0 16px; color: #1B2A4A; font-size: 16px; font-weight: 600;">${safeSubject}</p>
              <p style="margin: 0 0 8px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
              <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">${safeBody.replace(/\n/g, "<br />")}</p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send support notification email:", error);
  }
}

export async function sendAnnouncementEmail(to: string, subject: string, body: string) {
  try {
    const safeSubject = escapeHtml(subject);
    const safeBody = escapeHtml(body);
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: safeSubject,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #f8f7f4;">
          <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e8e5de;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #1B2A4A; font-family: 'Lora', serif; margin: 0; font-size: 22px;">${safeSubject}</h2>
            </div>
            <div style="color: #333; font-size: 15px; line-height: 1.7;">
              ${safeBody.replace(/\n/g, "<br />")}
            </div>
            <hr style="border: none; border-top: 1px solid #e8e5de; margin: 24px 0;" />
            <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
              ClinicalPlay &mdash; Premium Telehealth Platform
            </p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send announcement email:", error);
    return false;
  }
}
