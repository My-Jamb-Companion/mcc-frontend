/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { LoginForm } from "./LoginForm";
import * as authService from "../services/auth.service";
import { useAuthStore } from "@mcc/store";
// import * as sessionService from "../services/session";

// ─── mock @mcc/ui ─────────────────────────────────────────────────────────────
// AnimatePresence, motion, and Icon don't work in jsdom — replace with plain HTML
vi.mock("@mcc/ui", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: new Proxy(
    {},
    {
      get(_target, tag) {
        return ({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) => {
          // strip motion-specific props that are invalid on HTML elements
          const {
            initial: _initial, animate: _animate, exit: _exit, transition: _transition,
            layout: _layout, layoutId: _layoutId, whileHover: _whileHover, whileTap: _whileTap,
            ...rest
          } = props;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.createElement(String(tag) as any, rest as any, children);
        };
      },
    },
  ),
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

// ─── mock service layer ───────────────────────────────────────────────────────
vi.mock("../services/auth.service", () => ({
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
}));

vi.mock("../services/session", () => ({
  saveSession: vi.fn(),
  clearSession: vi.fn(),
  getStoredUser: vi.fn().mockReturnValue(null),
  getStoredAccessToken: vi.fn().mockReturnValue(null),
}));

const mockLoginApi = vi.mocked(authService.loginApi);

// ─── mock user + login response ───────────────────────────────────────────────
const mockLoginResponse = {
  access_token: "access-tok",
  refresh_token: "refresh-tok",
  token_type: "Bearer",
  expires_in: 3600,
  user: { user_id: "1", email: "user@example.com", role: "student" as const },
};

// ─── providers wrapper ────────────────────────────────────────────────────────
function Providers({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── reset before each test ───────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ user: null, accessToken: null });
});

// ─────────────────────────────────────────────────────────────────────────────
// IT-11.1 — Validation
// ─────────────────────────────────────────────────────────────────────────────
describe("form validation", () => {

  it("shows validation errors when form is submitted empty", async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: Providers });

    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    // API should NOT have been called
    expect(mockLoginApi).not.toHaveBeenCalled();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// IT-11.2 — Loading state
// ─────────────────────────────────────────────────────────────────────────────
describe("loading state", () => {

  it("shows logging in screen while login is in progress", async () => {
    // never resolves — keeps mutation pending
    mockLoginApi.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: Providers });

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/logging you into your account/i),
      ).toBeInTheDocument();
    });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// IT-11.3 — Success
// ─────────────────────────────────────────────────────────────────────────────
describe("successful login", () => {

  it("calls onSuccess callback after successful login", async () => {
    mockLoginApi.mockResolvedValue(mockLoginResponse);
    const onSuccess = vi.fn();

    const user = userEvent.setup();
    render(<LoginForm onSuccess={onSuccess} />, { wrapper: Providers });

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// IT-11.4 — Error state
// ─────────────────────────────────────────────────────────────────────────────
describe("failed login", () => {

  it("shows API error message when credentials are wrong", async () => {
    mockLoginApi.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });

    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: Providers });

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  // IT-11.5
  it("shows the login form again after a failed login", async () => {
    mockLoginApi.mockRejectedValue(new Error("Server error"));

    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: Providers });

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /log in/i }),
      ).toBeInTheDocument();
    });
  });

});