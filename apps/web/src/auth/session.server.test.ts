import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCookie, getRequest, useSession } from "@tanstack/react-start/server";
import { readAuth, SESSION_COOKIE, signIn, signOut } from "./session.server";

vi.mock("@tanstack/react-start/server", () => ({
  getCookie: vi.fn(),
  getRequest: vi.fn(),
  setResponseHeader: vi.fn(),
  useSession: vi.fn(),
}));

const session = { data: {} as { authenticated?: boolean }, update: vi.fn(), clear: vi.fn() };

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("SESSION_SECRET", "test-session-secret-with-at-least-32-characters");
  session.data = {};
  vi.mocked(getRequest).mockReturnValue(new Request("http://localhost:5173/login"));
  vi.mocked(useSession).mockResolvedValue(
    session as unknown as Awaited<ReturnType<typeof useSession>>,
  );
});
afterEach(() => vi.unstubAllEnvs());

describe("temporary application session", () => {
  it("reads anonymous visits without creating a session or requiring a secret", async () => {
    vi.stubEnv("SESSION_SECRET", "");
    expect(await readAuth()).toEqual({ isAuthenticated: false });
    expect(getCookie).toHaveBeenCalledWith(SESSION_COOKIE);
    expect(useSession).not.toHaveBeenCalled();
  });
  it.each([
    ["admin", "wrong"],
    ["wrong", "admin"],
    ["", ""],
    ["ADMIN", "admin"],
  ])("rejects credentials %s / %s without issuing a session", async (user, password) => {
    expect(await signIn(user, password)).toEqual({ ok: false });
    expect(useSession).not.toHaveBeenCalled();
  });
  it("creates an eight-hour HttpOnly session for admin/admin and rotates previous state", async () => {
    expect(await signIn("admin", "admin")).toEqual({ ok: true });
    expect(session.clear).toHaveBeenCalled();
    expect(session.update).toHaveBeenCalledWith({ authenticated: true });
    expect(useSession).toHaveBeenCalledWith(
      expect.objectContaining({
        name: SESSION_COOKIE,
        maxAge: 28800,
        cookie: expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          path: "/",
        }),
      }),
    );
  });
  it("uses secure partitioned cookies for HTTPS previews", async () => {
    vi.mocked(getRequest).mockReturnValue(new Request("https://preview.example/login"));
    await signIn("admin", "admin");
    expect(useSession).toHaveBeenCalledWith(
      expect.objectContaining({
        cookie: expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "none",
          partitioned: true,
        }),
      }),
    );
  });
  it("only accepts the authenticated flag from the sealed session", async () => {
    vi.mocked(getCookie).mockReturnValue("sealed-cookie");
    expect(await readAuth()).toEqual({ isAuthenticated: false });
    session.data.authenticated = true;
    expect(await readAuth()).toEqual({ isAuthenticated: true });
  });
  it("clears the application session on logout", async () => {
    vi.mocked(getCookie).mockReturnValue("sealed-cookie");
    await signOut();
    expect(session.clear).toHaveBeenCalled();
  });
  it("makes anonymous logout idempotent", async () => {
    await signOut();
    expect(useSession).not.toHaveBeenCalled();
  });
  it("rejects an explicitly configured short signing secret", async () => {
    vi.stubEnv("SESSION_SECRET", "too-short");
    await expect(signIn("admin", "admin")).rejects.toThrow("at least 32 characters");
  });
  it("requires a configured secret outside development", async () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("SESSION_SECRET", "");
    await expect(signIn("admin", "admin")).rejects.toThrow("SESSION_SECRET");
  });
});
