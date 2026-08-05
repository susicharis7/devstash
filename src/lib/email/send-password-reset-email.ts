import { createPasswordResetToken } from "@/lib/auth/password-reset-tokens";
import { buildAppUrl, sendEmail } from "@/lib/email/send-email";
import { passwordResetEmail } from "@/lib/email/templates/password-reset-email";

interface SendPasswordResetEmailInput {
  email: string;
  name: string | null;
  origin: string;
}

export async function sendPasswordResetEmail({
  email,
  name,
  origin,
}: SendPasswordResetEmailInput) {
  try {
    const token = await createPasswordResetToken(email);
    const url = buildAppUrl(
      `/reset-password?token=${encodeURIComponent(token)}`,
      origin
    );

    return await sendEmail({ to: email, ...passwordResetEmail({ url, name }) });
  } catch (error) {
    console.error("[password-reset-email] Could not create the token", error);
    return false;
  }
}
