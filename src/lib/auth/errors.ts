import { CredentialsSignin } from "next-auth";

export const EMAIL_NOT_VERIFIED_CODE = "EmailNotVerified";

export class EmailNotVerifiedError extends CredentialsSignin {
  code = EMAIL_NOT_VERIFIED_CODE;
}
