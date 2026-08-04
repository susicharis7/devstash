import { createVerificationToken } from "@/lib/auth/verification-tokens";
import { getResendClient } from "@/lib/email/resend";
import { verificationEmail } from "@/lib/email/templates/verification-email";

const DEFAULT_FROM = "DevStash <onboarding@resend.dev>";

interface SendVerificationEmailInput {
  userId: string;
  email: string;
  name: string | null;
  origin: string;
}

function buildVerificationUrl(token: string, origin: string) {
  const base = (process.env.AUTH_URL || origin).replace(/\/+$/, "");

  return `${base}/verify-email?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail({
  userId,
  email,
  name,
  origin,
}: SendVerificationEmailInput) {
  try {
    const token = await createVerificationToken(userId);
    const { subject, html, text } = verificationEmail({
      url: buildVerificationUrl(token, origin),
      name,
    });

    const { error } = await getResendClient().emails.send({
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to: email,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[verification-email] Resend rejected the send", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[verification-email] Could not send", error);
    return false;
  }
}
