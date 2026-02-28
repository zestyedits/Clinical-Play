import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "clinicalplayapp@gmail.com";
const FROM_EMAIL = "ClinicalPlay <hello@clinicalplay.app>";

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

export async function sendWaitlistConfirmationEmail(email: string, name?: string | null) {
  try {
    const safeEmail = escapeHtml(email);
    const safeName = name ? escapeHtml(name) : null;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "You're on the ClinicalPlay waitlist 🎉",
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #f8f7f4;">
          <div style="background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e8e5de;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #1B2A4A; font-family: 'Lora', Georgia, serif; margin: 0 0 8px; font-size: 24px;">You're in${safeName ? `, ${safeName}` : ""}.</h1>
              <p style="color: #666; font-size: 14px; margin: 0;">Thanks for joining the ClinicalPlay waitlist.</p>
            </div>

            <div style="background: #f8f7f4; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 6px; color: #777; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;">Email</p>
              <p style="margin: 0; color: #1B2A4A; font-size: 15px; font-weight: 600;">${safeEmail}</p>
            </div>

            <p style="color: #444; font-size: 14px; line-height: 1.7; margin: 0 0 10px;">
              You'll be among the first to hear when ClinicalPlay opens for early clinicians, along with a special founding member offer.
            </p>
            <p style="color: #777; font-size: 13px; line-height: 1.6; margin: 0 0 18px;">
              In the meantime, feel free to reply to this email if you'd like to share anything about your practice or what you'd love ClinicalPlay to help with.
            </p>

            <p style="color: #888; font-size: 12px; margin: 24px 0 0; text-align: center;">
              Warmly,<br/>
              The ClinicalPlay team
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send waitlist confirmation email:", error);
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

export async function sendWelcomeVerificationEmail(
  email: string,
  firstName: string,
  verificationLink: string,
) {
  try {
    const safeName = escapeHtml(firstName);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to ClinicalPlay — Verify Your Email",
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #f8f7f4;">
          <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e8e5de;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #1B2A4A; font-family: 'Lora', serif; margin: 0 0 8px; font-size: 26px;">Welcome, ${safeName}!</h1>
              <p style="color: #666; font-size: 15px; margin: 0;">We're excited to have you on board.</p>
            </div>
            <div style="color: #333; font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
              <p style="margin: 0 0 12px;">Thank you for joining <strong style="color: #1B2A4A;">ClinicalPlay</strong> — the premium telehealth platform designed for play therapists and clinicians.</p>
              <p style="margin: 0;">Please verify your email address to unlock the full experience:</p>
            </div>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${verificationLink}" style="display: inline-block; background: #1B2A4A; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 12px;">Verify Your Email</a>
            </div>
            <div style="background: #f8f7f4; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.6; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br />
                <a href="${verificationLink}" style="color: #1B2A4A; word-break: break-all; font-size: 12px;">${verificationLink}</a>
              </p>
            </div>
            <hr style="border: none; border-top: 1px solid #e8e5de; margin: 24px 0;" />
            <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
              ClinicalPlay &mdash; Premium Telehealth Platform
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome verification email:", error);
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
