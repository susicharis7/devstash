import { createVerificationToken } from "@/lib/auth/verification-tokens";
import { buildAppUrl, sendEmail } from "@/lib/email/send-email";
import { verificationEmail } from "@/lib/email/templates/verification-email";

interface SendVerificationEmailInput {
  userId: string;
  email: string;
  name: string | null;
  origin: string;
}

export async function sendVerificationEmail({
  userId,
  email,
  name,
  origin,
}: SendVerificationEmailInput) {
  try {
    const token = await createVerificationToken(userId);
    const url = buildAppUrl(
      `/verify-email?token=${encodeURIComponent(token)}`,
      origin
    );

    return await sendEmail({ to: email, ...verificationEmail({ url, name }) });
  } catch (error) {
    console.error("[verification-email] Could not create the token", error);
    return false;
  }
}
