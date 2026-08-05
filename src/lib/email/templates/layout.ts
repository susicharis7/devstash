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

export interface EmailContent {
  preview: string;
  heading: string;
  intro: string;
  ctaLabel: string;
  ctaUrl: string;
  footnote: string;
  closing: string;
}

export function renderEmail(content: EmailContent) {
  const safe = {
    preview: escapeHtml(content.preview),
    heading: escapeHtml(content.heading),
    intro: escapeHtml(content.intro),
    ctaLabel: escapeHtml(content.ctaLabel),
    ctaUrl: escapeHtml(content.ctaUrl),
    footnote: escapeHtml(content.footnote),
    closing: escapeHtml(content.closing),
  };

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <title>${safe.heading}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${COLORS.page};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safe.preview}</div>
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
                <h1 style="margin:0 0 8px;color:${COLORS.text};font-size:20px;font-weight:600;letter-spacing:-0.01em;">${safe.heading}</h1>
                <p style="margin:0 0 24px;color:${COLORS.muted};font-size:14px;line-height:22px;">
                  ${safe.intro}
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-radius:8px;background-color:${COLORS.button};">
                      <a href="${safe.ctaUrl}" style="display:inline-block;padding:12px 24px;color:${COLORS.buttonText};font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">${safe.ctaLabel}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;color:${COLORS.muted};font-size:13px;line-height:20px;">
                  ${safe.footnote}
                </p>
                <p style="margin:16px 0 0;color:${COLORS.muted};font-size:13px;line-height:20px;word-break:break-all;">
                  If the button doesn't work, paste this into your browser:<br />
                  <a href="${safe.ctaUrl}" style="color:${COLORS.text};">${safe.ctaUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:24px;color:${COLORS.muted};font-size:12px;line-height:18px;">
                ${safe.closing}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    content.intro,
    "",
    `${content.ctaLabel}:`,
    content.ctaUrl,
    "",
    content.footnote,
    content.closing,
  ].join("\n");

  return { html, text };
}
