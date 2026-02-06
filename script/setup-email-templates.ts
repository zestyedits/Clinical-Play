const SUPABASE_URL = process.env.SUPABASE_URL || "";
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || "";
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || "";

if (!PROJECT_REF || !ACCESS_TOKEN) {
  console.error("Missing SUPABASE_URL or SUPABASE_ACCESS_TOKEN environment variables.");
  console.error("Set SUPABASE_ACCESS_TOKEN from: https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

const BRAND = {
  name: "ClinicalPlay",
  tagline: "Playful Healing",
  primaryColor: "#1B2A4A",
  accentColor: "#C9A96E",
  bgColor: "#FDFBF7",
  textColor: "#374151",
  mutedColor: "#6B7280",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  serifFont: "'Georgia', 'Times New Roman', serif",
};

function emailWrapper(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bgColor};font-family:${BRAND.fontFamily};color:${BRAND.textColor};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bgColor};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="{{ .SiteURL }}/images/logo-full.png" alt="ClinicalPlay" width="180" style="display:block;height:auto;" />
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:20px;padding:40px 36px;border:1px solid rgba(0,0,0,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.04);">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:${BRAND.mutedColor};line-height:1.6;">
                ${BRAND.name} &middot; Playful Healing<br/>
                <span style="font-size:11px;opacity:0.7;">This email was sent because an action was taken on your account.</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const templates = {
  mailer_subjects_confirmation: "Verify your email — ClinicalPlay",
  mailer_templates_confirmation_content: emailWrapper("Verify Your Email", `
    <h1 style="margin:0 0 8px;font-family:${BRAND.serifFont};font-size:26px;font-weight:600;color:${BRAND.primaryColor};">Welcome to ClinicalPlay</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.mutedColor};line-height:1.5;">We're excited to have you. Please verify your email address to get started.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:${BRAND.primaryColor};border-radius:14px;">
          <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">Verify Email Address</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:${BRAND.mutedColor};line-height:1.5;">If the button doesn't work, copy and paste this link into your browser:<br/>
    <a href="{{ .ConfirmationURL }}" style="color:${BRAND.accentColor};word-break:break-all;">{{ .ConfirmationURL }}</a></p>
  `),

  mailer_subjects_recovery: "Reset your password — ClinicalPlay",
  mailer_templates_recovery_content: emailWrapper("Reset Your Password", `
    <h1 style="margin:0 0 8px;font-family:${BRAND.serifFont};font-size:26px;font-weight:600;color:${BRAND.primaryColor};">Reset Your Password</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.mutedColor};line-height:1.5;">We received a request to reset your password. Click the button below to choose a new one.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:${BRAND.primaryColor};border-radius:14px;">
          <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">Reset Password</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:${BRAND.mutedColor};line-height:1.5;">If you didn't request this, you can safely ignore this email.</p>
  `),

  mailer_subjects_magic_link: "Your sign-in link — ClinicalPlay",
  mailer_templates_magic_link_content: emailWrapper("Sign In to ClinicalPlay", `
    <h1 style="margin:0 0 8px;font-family:${BRAND.serifFont};font-size:26px;font-weight:600;color:${BRAND.primaryColor};">Sign In</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.mutedColor};line-height:1.5;">Click the button below to sign in to your ClinicalPlay account.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:${BRAND.primaryColor};border-radius:14px;">
          <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">Sign In</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:${BRAND.mutedColor};line-height:1.5;">If you didn't request this link, you can safely ignore this email.</p>
  `),

  mailer_subjects_email_change: "Confirm your new email — ClinicalPlay",
  mailer_templates_email_change_content: emailWrapper("Confirm Email Change", `
    <h1 style="margin:0 0 8px;font-family:${BRAND.serifFont};font-size:26px;font-weight:600;color:${BRAND.primaryColor};">Confirm Email Change</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.mutedColor};line-height:1.5;">Please confirm the update to your email address by clicking the button below.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:${BRAND.primaryColor};border-radius:14px;">
          <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">Confirm New Email</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:${BRAND.mutedColor};line-height:1.5;">If you didn't make this change, please contact support immediately.</p>
  `),

  mailer_subjects_invite: "You've been invited to ClinicalPlay",
  mailer_templates_invite_content: emailWrapper("You're Invited", `
    <h1 style="margin:0 0 8px;font-family:${BRAND.serifFont};font-size:26px;font-weight:600;color:${BRAND.primaryColor};">You're Invited</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.mutedColor};line-height:1.5;">You've been invited to join ClinicalPlay — a premium platform for interactive therapeutic engagement.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:${BRAND.primaryColor};border-radius:14px;">
          <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">Accept Invitation</a>
        </td>
      </tr>
    </table>
  `),
};

async function apply() {
  console.log(`Applying branded email templates to project: ${PROJECT_REF}`);

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templates),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed (${res.status}):`, text);
    process.exit(1);
  }

  console.log("Email templates updated successfully!");
}

apply();
