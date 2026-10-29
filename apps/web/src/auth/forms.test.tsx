import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";
import { LogoutButton } from "./LogoutButton";
import { login, logout } from "./functions";

const mocks = vi.hoisted(() => ({ clear: vi.fn() }));
vi.mock("./functions", () => ({ login: vi.fn(), logout: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ clear: mocks.clear }) }));
vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname: "/map", searchStr: "?scenario=mascleta&time=840" } }),
}));

const originalLocation = Object.getOwnPropertyDescriptor(window, "location")!;
const replace = vi.fn();
beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(window, "location", { configurable: true, value: { replace } });
});
afterEach(() => {
  cleanup();
  Object.defineProperty(window, "location", originalLocation);
});

function submitLogin() {
  fireEvent.change(screen.getByLabelText("Usuario"), { target: { value: "admin" } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "admin" } });
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("login form", () => {
  it("uses the selected English language for fields, actions and errors", async () => {
    vi.mocked(login).mockResolvedValue({ ok: false });
    render(<LoginForm destination="/home" locale="en" />);
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect username or password");
  });
  it("announces rejected credentials and allows another attempt", async () => {
    vi.mocked(login).mockResolvedValue({ ok: false });
    render(<LoginForm destination="/home" />);
    submitLogin();
    expect(await screen.findByRole("alert")).toHaveTextContent("Usuario o contraseña incorrectos");
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
  });
  it("disables repeated submissions while pending and opens the requested page on success", async () => {
    let resolve!: (value: { ok: boolean }) => void;
    vi.mocked(login).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    render(<LoginForm destination="/map?scenario=mascleta" />);
    submitLogin();
    expect(screen.getByRole("button", { name: "Entrando…" })).toBeDisabled();
    expect(screen.getByLabelText("Usuario")).toBeDisabled();
    expect(login).toHaveBeenCalledExactlyOnceWith({ data: { user: "admin", password: "admin" } });
    resolve({ ok: true });
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/map?scenario=mascleta"));
  });
  it("shows a recoverable error when the server is unavailable", async () => {
    vi.mocked(login).mockRejectedValue(new Error("unavailable"));
    render(<LoginForm destination="/home" />);
    submitLogin();
    expect(await screen.findByRole("alert")).toHaveTextContent("No se ha podido iniciar sesión");
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });
});

describe("shared header logout", () => {
  it("clears data caches and replaces the private map with its public scenario", async () => {
    vi.mocked(logout).mockResolvedValue({ ok: true });
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/es/demo/map?scenario=mascleta&time=840"),
    );
    expect(mocks.clear).toHaveBeenCalled();
  });
  it("keeps the current page and allows retry after a logout error", async () => {
    vi.mocked(logout).mockRejectedValue(new Error("unavailable"));
    render(<LogoutButton locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not sign out");
    expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
    expect(mocks.clear).not.toHaveBeenCalled();
  });
});
