const SUBJECT = "Verify your DevStash email";

const COLORS = {
  page: "#0a0a0a",
  card: "#171717",
  border: "#2a2a2a",
  text: "#fafafa",
  muted: "#a3a3a3",
  button: "#fafafa",
  buttonText: "#171717",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function verificationEmail({
  url,
  name,
}: {
  url: string;
  name: string | null;
}) {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi,";
  const safeUrl = escapeHtml(url);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <title>${SUBJECT}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${COLORS.page};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Confirm your email address to finish setting up DevStash.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.page};padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <tr>
              <td align="center" style="padding-bottom:28px;color:${COLORS.text};font-size:18px;font-weight:600;letter-spacing:-0.01em;">
                DevStash
              </td>
            </tr>
            <tr>
              <td style="background-color:${COLORS.card};border:1px solid ${COLORS.border};border-radius:12px;padding:32px;">
                <h1 style="margin:0 0 8px;color:${COLORS.text};font-size:20px;font-weight:600;letter-spacing:-0.01em;">Verify your email</h1>
                <p style="margin:0 0 24px;color:${COLORS.muted};font-size:14px;line-height:22px;">
                  ${greeting} confirm this address to activate your DevStash account. You won't be able to sign in until you do.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-radius:8px;background-color:${COLORS.button};">
                      <a href="${safeUrl}" style="display:inline-block;padding:12px 24px;color:${COLORS.buttonText};font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">Verify email address</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;color:${COLORS.muted};font-size:13px;line-height:20px;">
                  This link expires in 24 hours and can only be used once.
                </p>
                <p style="margin:16px 0 0;color:${COLORS.muted};font-size:13px;line-height:20px;word-break:break-all;">
                  If the button doesn't work, paste this into your browser:<br />
                  <a href="${safeUrl}" style="color:${COLORS.text};">${safeUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:24px;color:${COLORS.muted};font-size:12px;line-height:18px;">
                Didn't create a DevStash account? You can safely ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `${name ? `Hi ${name},` : "Hi,"} confirm this address to activate your DevStash account.`,
    "",
    "Verify your email:",
    url,
    "",
    "This link expires in 24 hours and can only be used once.",
    "Didn't create a DevStash account? You can safely ignore this email.",
  ].join("\n");

  return { subject: SUBJECT, html, text };
}
