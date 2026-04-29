import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import NewPassword from "./NewPassword";

// ─── mock @mcc/ui ─────────────────────────────────────────────────────────────
vi.mock("@mcc/ui", () => ({
  Icon: ({ name }: { name: string }) =>
    React.createElement("span", { "data-testid": `icon-${name}` }),
  AnimatePresence: ({ children }: { children: ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        const Component = ({
          children,
          initial: _i,
          animate: _a,
          exit: _e,
          transition: _t,
          layout: _l,
          layoutId: _lid,
          whileHover: _wh,
          whileTap: _wt,
          ...rest
        }: Record<string, unknown> & { children?: ReactNode }) =>
          React.createElement(tag, rest, children);
        Component.displayName = `motion.${tag}`;
        return Component;
      },
    },
  ),
}));

// ─── mock next/navigation ─────────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ─── mock @mcc/api ────────────────────────────────────────────────────────────
vi.mock("@mcc/api", () => ({
  extractApiError: vi.fn(
    (error: unknown, fallback = "Something went wrong") => {
      if (
        error !== null &&
        typeof error === "object" &&
        "response" in error
      ) {
        return (error as { response: { data: { message: string } } }).response
          ?.data?.message ?? fallback;
      }
      return fallback;
    },
  ),
}));

// ─── mock confirmMutation via @mcc/features ───────────────────────────────────
const mockConfirmMutate = vi.fn();
const confirmMutationState = {
  isPending: false,
  isError: false,
  error: null as unknown,
};

vi.mock("@mcc/features", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mcc/features")>();
  return {
    ...actual,
    usePasswordReset: () => ({
      requestMutation: { mutate: vi.fn() },
      verifyMutation: { mutate: vi.fn() },
      confirmMutation: {
        ...confirmMutationState,
        mutate: mockConfirmMutate,
      },
    }),
  };
});

// ─── wrapper ──────────────────────────────────────────────────────────────────
function Providers({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── helper: set input value via native setter ────────────────────────────────
function setInputValue(input: HTMLElement, value: string) {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )!.set!;
  nativeSetter.call(input, value);
  fireEvent.input(input, { bubbles: true });
  fireEvent.change(input, { bubbles: true });
}

beforeEach(() => {
  vi.clearAllMocks();
  confirmMutationState.isPending = false;
  confirmMutationState.isError = false;
  confirmMutationState.error = null;
});

describe("NewPassword", () => {

  // IT-12.5
  it("shows error when confirm password does not match", async () => {
    render(<NewPassword verificationToken="vt-abc" />, { wrapper: Providers });

    setInputValue(screen.getByLabelText(/^new password/i), "password123");
    setInputValue(screen.getByLabelText(/confirm new password/i), "different");
    fireEvent.submit(screen.getByLabelText(/^new password/i).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  // IT-12.6
  it("shows API error when verification token has expired", async () => {
    confirmMutationState.isError = true;
    confirmMutationState.error = {
      response: { data: { message: "Token expired" } },
    };

    render(<NewPassword verificationToken="vt-abc" />, { wrapper: Providers });

    expect(screen.getByText("Token expired")).toBeInTheDocument();
  });

  // IT-12.7
  it("redirects to /login after successful password reset", async () => {
    mockConfirmMutate.mockImplementation(
      (_data: unknown, { onSuccess }: { onSuccess: () => void }) => {
        onSuccess();
      },
    );

    render(<NewPassword verificationToken="vt-abc" />, { wrapper: Providers });

    setInputValue(screen.getByLabelText(/^new password/i), "password123");
    setInputValue(
      screen.getByLabelText(/confirm new password/i),
      "password123",
    );
    fireEvent.submit(
      screen.getByLabelText(/^new password/i).closest("form")!,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

});