import { getResendClient } from "@/lib/email/resend";

const DEFAULT_FROM = "DevStash <onboarding@resend.dev>";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export function buildAppUrl(path: string, origin: string) {
  const base = (process.env.AUTH_URL || origin).replace(/\/+$/, "");

  return `${base}${path}`;
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  try {
    const { error } = await getResendClient().emails.send({
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error(`[email] Resend rejected "${subject}"`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[email] Could not send "${subject}"`, error);
    return false;
  }
}
