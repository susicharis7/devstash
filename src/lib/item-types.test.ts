import { describe, expect, it } from "vitest";

import {
  FALLBACK_COLOR,
  getSystemTypeBySlug,
  PRO_TYPE_NAMES,
  SYSTEM_ITEM_TYPES,
  SYSTEM_TYPE_ORDER,
  typeLabel,
  typeSlug,
} from "@/lib/item-types";

describe("typeSlug", () => {
  it("pluralizes a type name", () => {
    expect(typeSlug("snippet")).toBe("snippets");
    expect(typeSlug("link")).toBe("links");
  });
});

describe("typeLabel", () => {
  it("capitalizes and pluralizes a type name", () => {
    expect(typeLabel("snippet")).toBe("Snippets");
    expect(typeLabel("command")).toBe("Commands");
  });
});

describe("getSystemTypeBySlug", () => {
  it("resolves a plural slug back to its system type", () => {
    expect(getSystemTypeBySlug("snippets")?.name).toBe("snippet");
    expect(getSystemTypeBySlug("images")?.name).toBe("image");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getSystemTypeBySlug("bogus")).toBeUndefined();
  });

  it("does not resolve the singular name", () => {
    expect(getSystemTypeBySlug("snippet")).toBeUndefined();
  });

  it("round-trips every system type through its slug", () => {
    for (const type of SYSTEM_ITEM_TYPES) {
      expect(getSystemTypeBySlug(typeSlug(type.name))).toBe(type);
    }
  });
});

describe("derived constants", () => {
  it("orders every system type name", () => {
    expect(SYSTEM_TYPE_ORDER).toEqual(SYSTEM_ITEM_TYPES.map((t) => t.name));
  });

  it("marks exactly file and image as Pro", () => {
    expect([...PRO_TYPE_NAMES].sort()).toEqual(["file", "image"]);
  });

  it("exposes a fallback color", () => {
    expect(FALLBACK_COLOR).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
