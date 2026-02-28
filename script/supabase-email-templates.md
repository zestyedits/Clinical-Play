# Supabase Email Templates (ClinicalPlay Theme)

Supabase sends authentication emails (password reset, magic link, etc.) using its own templates. To match ClinicalPlay's look, paste the HTML below into **Supabase Dashboard → Authentication → Email Templates**.

Replace `{{ .ConfirmationURL }}`, `{{ .Token }}`, etc. exactly as shown — Supabase injects these variables.

---

## Reset Password

**Subject:** `Reset your ClinicalPlay password`

**Content (HTML):**

```html
<div style="font-family:'Inter',sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#FAF8F5;">
  <div style="background:#fff;border-radius:20px;padding:40px 36px;border:1px solid #e5dfd4;box-shadow:0 4px 24px rgba(46,43,39,0.06);">
    <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #e5dfd4;">
      <div style="font-family:'Lora',Georgia,serif;font-size:22px;font-weight:600;color:#4A7A56;">ClinicalPlay</div>
      <p style="margin:8px 0 0;font-size:12px;color:#6b655c;text-transform:uppercase;letter-spacing:0.12em;">Therapy tools that connect</p>
    </div>
    <h1 style="font-family:'Lora',Georgia,serif;font-size:24px;font-weight:600;color:#2e2b27;margin:0 0 8px;">Reset your password</h1>
    <p style="color:#6b655c;font-size:15px;margin:0 0 24px;">Click the button below to set a new password for your ClinicalPlay account.</p>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#4A7A56;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:16px 40px;border-radius:12px;box-shadow:0 4px 14px rgba(74,122,86,0.3);">Reset Password</a>
    </div>
    <div style="background:#FAF8F5;border-radius:12px;padding:16px 20px;border:1px solid #e5dfd4;">
      <p style="margin:0;color:#6b655c;font-size:12px;line-height:1.6;text-align:center;">If the button doesn't work, copy this link: <a href="{{ .ConfirmationURL }}" style="color:#4A7A56;word-break:break-all;">{{ .ConfirmationURL }}</a></p>
    </div>
    <div style="margin-top:36px;padding-top:24px;border-top:1px solid #e5dfd4;text-align:center;">
      <p style="margin:0;font-size:12px;color:#6b655c;">ClinicalPlay — Therapy tools that connect.</p>
    </div>
  </div>
</div>
```

---

## Confirm Signup

**Subject:** `Verify your ClinicalPlay email`

**Content (HTML):**

```html
<div style="font-family:'Inter',sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#FAF8F5;">
  <div style="background:#fff;border-radius:20px;padding:40px 36px;border:1px solid #e5dfd4;box-shadow:0 4px 24px rgba(46,43,39,0.06);">
    <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #e5dfd4;">
      <div style="font-family:'Lora',Georgia,serif;font-size:22px;font-weight:600;color:#4A7A56;">ClinicalPlay</div>
      <p style="margin:8px 0 0;font-size:12px;color:#6b655c;text-transform:uppercase;letter-spacing:0.12em;">Therapy tools that connect</p>
    </div>
    <h1 style="font-family:'Lora',Georgia,serif;font-size:24px;font-weight:600;color:#2e2b27;margin:0 0 8px;">Confirm your email</h1>
    <p style="color:#6b655c;font-size:15px;margin:0 0 24px;">Click the button below to verify your email and activate your ClinicalPlay account.</p>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#4A7A56;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:16px 40px;border-radius:12px;box-shadow:0 4px 14px rgba(74,122,86,0.3);">Verify Email</a>
    </div>
    <div style="margin-top:36px;padding-top:24px;border-top:1px solid #e5dfd4;text-align:center;">
      <p style="margin:0;font-size:12px;color:#6b655c;">ClinicalPlay — Therapy tools that connect.</p>
    </div>
  </div>
</div>
```

---

**Note:** Our app also sends a branded verification email via Resend when users sign up. Supabase’s built-in confirmation is a fallback. If you prefer one flow, disable “Confirm email” in Supabase and rely on our Resend flow, or use Supabase’s with the template above for consistency.
