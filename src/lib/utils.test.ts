import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("lets later tailwind classes win conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("resolves conditional objects", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });
});
