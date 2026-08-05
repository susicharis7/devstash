import { describe, expect, it } from "vitest";

import { getClientIp, rateLimitMessage } from "@/lib/rate-limit";

function requestWithHeaders(headers: Record<string, string>) {
  return new Request("https://example.com", { headers });
}

describe("getClientIp", () => {
  it("uses the first entry of x-forwarded-for", () => {
    const request = requestWithHeaders({
      "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178",
    });
    expect(getClientIp(request)).toBe("203.0.113.7");
  });

  it("trims whitespace around the forwarded ip", () => {
    const request = requestWithHeaders({ "x-forwarded-for": "  203.0.113.7  " });
    expect(getClientIp(request)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip when there is no forwarded header", () => {
    const request = requestWithHeaders({ "x-real-ip": "198.51.100.5" });
    expect(getClientIp(request)).toBe("198.51.100.5");
  });

  it("falls back to a loopback address when nothing is present", () => {
    expect(getClientIp(requestWithHeaders({}))).toBe("127.0.0.1");
  });
});

describe("rateLimitMessage", () => {
  it("rounds up to whole minutes and pluralizes", () => {
    expect(rateLimitMessage(1)).toContain("1 minute");
    expect(rateLimitMessage(61)).toContain("2 minutes");
    expect(rateLimitMessage(900)).toContain("15 minutes");
  });

  it("uses the singular unit for exactly one minute", () => {
    expect(rateLimitMessage(60)).toContain("1 minute");
    expect(rateLimitMessage(60)).not.toContain("minutes");
  });
});
