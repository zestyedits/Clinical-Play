import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "clinicalplayapp@gmail.com";
const FROM_EMAIL = "ClinicalPlay <hello@clinicalplay.app>";

/* ClinicalPlay theme — sage green, warm cream, Lora/Inter */
const COLORS = {
  primary: "#4A7A56",
  primaryDark: "#3d6648",
  cream: "#FAF8F5",
  ivory: "#FDFCF9",
  foreground: "#2e2b27",
  muted: "#6b655c",
  border: "#e5dfd4",
  accent: "#c47a5e",
  white: "#ffffff",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function emailWrapper(title: string, content: string, footerText = "ClinicalPlay — Therapy tools that connect."): string {
  const safeTitle = escapeHtml(title);
  const safeFooter = escapeHtml(footerText);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:${COLORS.cream};color:${COLORS.foreground};line-height:1.6;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <div style="background:${COLORS.white};border-radius:20px;padding:40px 36px;border:1px solid ${COLORS.border};box-shadow:0 4px 24px rgba(46,43,39,0.06);">
      <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid ${COLORS.border};">
        <div style="font-family:'Lora',Georgia,serif;font-size:22px;font-weight:600;color:${COLORS.primary};letter-spacing:-0.02em;">ClinicalPlay</div>
        <p style="margin:8px 0 0;font-size:12px;color:${COLORS.muted};text-transform:uppercase;letter-spacing:0.12em;">Therapy tools that connect</p>
      </div>
      ${content}
      <div style="margin-top:36px;padding-top:24px;border-top:1px solid ${COLORS.border};text-align:center;">
        <p style="margin:0;font-size:12px;color:${COLORS.muted};">${safeFooter}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function notifyAdminWaitlistSignup(email: string, name?: string | null) {
  try {
    const safeEmail = escapeHtml(email);
    const safeName = name ? escapeHtml(name) : null;
    const content = `
      <h1 style="font-family:'Lora',Georgia,serif;font-size:24px;font-weight:600;color:${COLORS.foreground};margin:0 0 8px;">New Waitlist Signup</h1>
      <p style="color:${COLORS.muted};font-size:14px;margin:0 0 24px;">Someone just joined your waitlist.</p>
      <div style="background:${COLORS.cream};border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid ${COLORS.border};">
        <p style="margin:0 0 6px;color:${COLORS.muted};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Email</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:${COLORS.foreground};">${safeEmail}</p>
        ${safeName ? `
        <p style="margin:16px 0 6px;color:${COLORS.muted};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Name</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:${COLORS.foreground};">${safeName}</p>
        ` : ""}
      </div>
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Waitlist Signup: ${safeEmail}`,
      html: emailWrapper("New Waitlist Signup", content, "Sent from ClinicalPlay Waitlist"),
    });
  } catch (error) {
    console.error("Failed to send waitlist notification email:", error);
  }
}

export async function sendWaitlistConfirmationEmail(email: string, name?: string | null) {
  try {
    const safeEmail = escapeHtml(email);
    const safeName = name ? escapeHtml(name) : null;
    const content = `
      <h1 style="font-family:'Lora',Georgia,serif;font-size:26px;font-weight:600;color:${COLORS.foreground};margin:0 0 8px;">You're in${safeName ? `, ${safeName}` : ""}.</h1>
      <p style="color:${COLORS.muted};font-size:15px;margin:0 0 28px;">Thanks for joining the ClinicalPlay waitlist.</p>
      <div style="background:${COLORS.cream};border-radius:12px;padding:18px 20px;margin-bottom:24px;border:1px solid ${COLORS.border};">
        <p style="margin:0 0 6px;color:${COLORS.muted};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Registered as</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:${COLORS.foreground};">${safeEmail}</p>
      </div>
      <p style="color:${COLORS.foreground};font-size:15px;line-height:1.75;margin:0 0 12px;">
        You'll be among the first to hear when ClinicalPlay opens for early clinicians, along with a special founding member offer.
      </p>
      <p style="color:${COLORS.muted};font-size:14px;line-height:1.7;margin:0 0 28px;">
        In the meantime, feel free to reply to this email if you'd like to share anything about your practice or what you'd love ClinicalPlay to help with.
      </p>
      <p style="color:${COLORS.muted};font-size:14px;margin:0;font-style:italic;">
        Warmly,<br/>The ClinicalPlay team
      </p>
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "You're on the ClinicalPlay waitlist 🎉",
      html: emailWrapper("You're on the waitlist", content),
    });
  } catch (error) {
    console.error("Failed to send waitlist confirmation email:", error);
  }
}

export async function notifyAdminSupportMessage(userEmail: string, subject: string, body: string) {
  try {
    const safeEmail = escapeHtml(userEmail);
    const safeSubject = escapeHtml(subject);
    const safeBody = escapeHtml(body).replace(/\n/g, "<br />");
    const content = `
      <h1 style="font-family:'Lora',Georgia,serif;font-size:24px;font-weight:600;color:${COLORS.foreground};margin:0 0 8px;">Support Request</h1>
      <p style="color:${COLORS.muted};font-size:14px;margin:0 0 24px;">A user has submitted a support message.</p>
      <div style="background:${COLORS.cream};border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid ${COLORS.border};">
        <p style="margin:0 0 6px;color:${COLORS.muted};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">From</p>
        <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:${COLORS.foreground};">${safeEmail}</p>
        <p style="margin:0 0 6px;color:${COLORS.muted};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Subject</p>
        <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:${COLORS.foreground};">${safeSubject}</p>
        <p style="margin:0 0 6px;color:${COLORS.muted};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Message</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:${COLORS.foreground};">${safeBody}</p>
      </div>
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Support Request: ${safeSubject}`,
      html: emailWrapper("Support Request", content, "ClinicalPlay Support"),
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
    const content = `
      <h1 style="font-family:'Lora',Georgia,serif;font-size:26px;font-weight:600;color:${COLORS.foreground};margin:0 0 8px;">Welcome, ${safeName}!</h1>
      <p style="color:${COLORS.muted};font-size:15px;margin:0 0 24px;">We're excited to have you on board.</p>
      <p style="color:${COLORS.foreground};font-size:15px;line-height:1.75;margin:0 0 28px;">
        Thank you for joining <strong style="color:${COLORS.primary};">ClinicalPlay</strong> — the premium telehealth platform designed for play therapists and clinicians. Please verify your email to unlock the full experience.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${verificationLink}" style="display:inline-block;background:${COLORS.primary};color:${COLORS.white};font-size:15px;font-weight:600;text-decoration:none;padding:16px 40px;border-radius:12px;box-shadow:0 4px 14px rgba(74,122,86,0.3);">Verify Your Email</a>
      </div>
      <div style="background:${COLORS.cream};border-radius:12px;padding:16px 20px;border:1px solid ${COLORS.border};">
        <p style="margin:0;color:${COLORS.muted};font-size:12px;line-height:1.6;text-align:center;">
          If the button doesn't work, copy this link into your browser:<br/>
          <a href="${verificationLink}" style="color:${COLORS.primary};word-break:break-all;font-size:11px;">${verificationLink}</a>
        </p>
      </div>
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to ClinicalPlay — Verify Your Email",
      html: emailWrapper("Verify your email", content),
    });
  } catch (error) {
    console.error("Failed to send welcome verification email:", error);
  }
}

export async function sendAnnouncementEmail(to: string, subject: string, body: string) {
  try {
    const safeSubject = escapeHtml(subject);
    const safeBody = escapeHtml(body).replace(/\n/g, "<br />");
    const content = `
      <h1 style="font-family:'Lora',Georgia,serif;font-size:24px;font-weight:600;color:${COLORS.foreground};margin:0 0 24px;">${safeSubject}</h1>
      <div style="color:${COLORS.foreground};font-size:15px;line-height:1.75;">
        ${safeBody}
      </div>
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: safeSubject,
      html: emailWrapper(safeSubject, content),
    });
    return true;
  } catch (error) {
    console.error("Failed to send announcement email:", error);
    return false;
  }
}
