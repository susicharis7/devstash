import { afterEach, describe, expect, it, vi } from "vitest";

import { buildAppUrl } from "@/lib/email/send-email";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("buildAppUrl", () => {
  it("prefers AUTH_URL over the request origin", () => {
    vi.stubEnv("AUTH_URL", "https://devstash.app");
    expect(buildAppUrl("/verify-email?token=x", "https://ignored.test")).toBe(
      "https://devstash.app/verify-email?token=x"
    );
  });

  it("strips trailing slashes from the base", () => {
    vi.stubEnv("AUTH_URL", "https://devstash.app///");
    expect(buildAppUrl("/reset", "https://ignored.test")).toBe(
      "https://devstash.app/reset"
    );
  });

  it("falls back to the origin when AUTH_URL is unset", () => {
    vi.stubEnv("AUTH_URL", "");
    expect(buildAppUrl("/reset", "https://from-origin.test/")).toBe(
      "https://from-origin.test/reset"
    );
  });
});
