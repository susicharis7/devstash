import { CredentialsSignin } from "next-auth";

export const EMAIL_NOT_VERIFIED_CODE = "EmailNotVerified";
export const RATE_LIMITED_CODE = "RateLimited";

export class EmailNotVerifiedError extends CredentialsSignin {
  code = EMAIL_NOT_VERIFIED_CODE;
}

export class RateLimitedError extends CredentialsSignin {
  code = RATE_LIMITED_CODE;

  constructor(readonly retryAfterSeconds: number) {
    super();
  }
}
