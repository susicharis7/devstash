import { renderEmail } from "@/lib/email/templates/layout";

const SUBJECT = "Reset your DevStash password";

export function passwordResetEmail({
  url,
  name,
}: {
  url: string;
  name: string | null;
}) {
  const greeting = name ? `Hi ${name},` : "Hi,";

  return {
    subject: SUBJECT,
    ...renderEmail({
      preview: "Choose a new password for your DevStash account.",
      heading: "Reset your password",
      intro: `${greeting} choose a new password for your DevStash account. Your current password stays active until you do.`,
      ctaLabel: "Choose a new password",
      ctaUrl: url,
      footnote: "This link expires in 1 hour and can only be used once.",
      closing:
        "Didn't ask for this? Ignore this email and your password stays unchanged.",
    }),
  };
}
