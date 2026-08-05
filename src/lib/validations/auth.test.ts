import { describe, expect, it } from "vitest";

import {
  changePasswordSchema,
  registerSchema,
  signInSchema,
} from "@/lib/validations/auth";

describe("signInSchema", () => {
  it("lowercases the email", () => {
    const result = signInSchema.parse({
      email: "MixedCase@Test.com",
      password: "x",
    });
    expect(result.email).toBe("mixedcase@test.com");
  });

  it("rejects an invalid email", () => {
    expect(signInSchema.safeParse({ email: "nope", password: "x" }).success).toBe(
      false
    );
  });

  it("requires a non-empty password", () => {
    expect(
      signInSchema.safeParse({ email: "a@b.co", password: "" }).success
    ).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = {
    name: "Ada",
    email: "ada@example.com",
    password: "password1",
    confirmPassword: "password1",
  };

  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a password under 8 characters", () => {
    const result = registerSchema.safeParse({
      ...base,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password over 72 characters", () => {
    const long = "a".repeat(73);
    const result = registerSchema.safeParse({
      ...base,
      password: long,
      confirmPassword: long,
    });
    expect(result.success).toBe(false);
  });

  it("flags mismatched passwords on confirmPassword", () => {
    const result = registerSchema.safeParse({
      ...base,
      confirmPassword: "different1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });

  it("requires a trimmed non-empty name", () => {
    expect(
      registerSchema.safeParse({ ...base, name: "   " }).success
    ).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("rejects a new password equal to the current one", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "password1",
      password: "password1",
      confirmPassword: "password1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["password"]);
    }
  });

  it("accepts a distinct new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "password1",
      password: "password2",
      confirmPassword: "password2",
    });
    expect(result.success).toBe(true);
  });
});
