import { renderEmail } from "@/lib/email/templates/layout";

const SUBJECT = "Verify your DevStash email";

export function verificationEmail({
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
      preview: "Confirm your email address to finish setting up DevStash.",
      heading: "Verify your email",
      intro: `${greeting} confirm this address to activate your DevStash account. You won't be able to sign in until you do.`,
      ctaLabel: "Verify email address",
      ctaUrl: url,
      footnote: "This link expires in 24 hours and can only be used once.",
      closing:
        "Didn't create a DevStash account? You can safely ignore this email.",
    }),
  };
}
