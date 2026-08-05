import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ signOut: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));
vi.mock("@/lib/db/current-user", () => ({ getCurrentUserId: vi.fn() }));
vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

import { signOut } from "@/auth";
import { changePasswordAction, deleteAccountAction } from "@/actions/account";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getCurrentUserId } from "@/lib/db/current-user";
import { prisma } from "@/lib/prisma";

const validInput = {
  currentPassword: "oldpassword",
  password: "newpassword",
  confirmPassword: "newpassword",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getCurrentUserId).mockResolvedValue("user-1");
});

describe("changePasswordAction", () => {
  it("rejects when the user is not signed in", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);

    const result = await changePasswordAction(validInput);

    expect(result).toEqual({ success: false, error: "You are not signed in." });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns the first validation message for bad input", async () => {
    const result = await changePasswordAction({
      ...validInput,
      confirmPassword: "mismatch",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Passwords do not match");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("refuses when the account has no password (OAuth only)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      password: null,
    } as never);

    const result = await changePasswordAction(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toContain("GitHub");
    expect(verifyPassword).not.toHaveBeenCalled();
  });

  it("rejects an incorrect current password", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      password: "stored-hash",
    } as never);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    const result = await changePasswordAction(validInput);

    expect(result).toEqual({
      success: false,
      error: "Your current password is incorrect.",
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("hashes and stores a new password on success", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      password: "stored-hash",
    } as never);
    vi.mocked(verifyPassword).mockResolvedValue(true);
    vi.mocked(hashPassword).mockResolvedValue("new-hash");

    const result = await changePasswordAction(validInput);

    expect(result).toEqual({ success: true });
    expect(hashPassword).toHaveBeenCalledWith("newpassword");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: "new-hash" },
    });
  });

  it("returns a generic error when the database throws", async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error("db down"));

    const result = await changePasswordAction(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Something went wrong. Try again.");
  });
});

describe("deleteAccountAction", () => {
  it("deletes the row and signs the user out", async () => {
    vi.mocked(prisma.user.deleteMany).mockResolvedValue({ count: 1 } as never);

    const result = await deleteAccountAction();

    expect(result).toEqual({ success: true });
    expect(prisma.user.deleteMany).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/" });
  });

  it("rejects when the user is not signed in", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);

    const result = await deleteAccountAction();

    expect(result).toEqual({ success: false, error: "You are not signed in." });
    expect(prisma.user.deleteMany).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });
});
