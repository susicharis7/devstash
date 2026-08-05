import { CredentialsSignin } from "next-auth";
import { describe, expect, it } from "vitest";

import {
  EMAIL_NOT_VERIFIED_CODE,
  EmailNotVerifiedError,
  RATE_LIMITED_CODE,
  RateLimitedError,
} from "@/lib/auth/errors";

describe("EmailNotVerifiedError", () => {
  it("carries the EmailNotVerified code", () => {
    const error = new EmailNotVerifiedError();
    expect(error.code).toBe(EMAIL_NOT_VERIFIED_CODE);
    expect(error).toBeInstanceOf(CredentialsSignin);
  });
});

describe("RateLimitedError", () => {
  it("carries the RateLimited code and retry hint", () => {
    const error = new RateLimitedError(42);
    expect(error.code).toBe(RATE_LIMITED_CODE);
    expect(error.retryAfterSeconds).toBe(42);
    expect(error).toBeInstanceOf(CredentialsSignin);
  });
});
