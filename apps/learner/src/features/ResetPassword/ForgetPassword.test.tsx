import React, { type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ForgetPassword from "./ForgetPassword";

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
        "response" in error &&
        (error as { response: { data: { message: string } } }).response?.data
          ?.message
      ) {
        return (error as { response: { data: { message: string } } }).response
          .data.message;
      }
      return fallback;
    },
  ),
}));

// ─── mock mutations via @mcc/features ────────────────────────────────────────
// We mock the hook that the components use, not internal service paths
const mockRequestMutate = vi.fn();
const mockVerifyMutate = vi.fn();
const mockConfirmMutate = vi.fn();
const mockResendMutate = vi.fn();

const requestMutationState = { isPending: false, isError: false, error: null };
const verifyMutationState = { isPending: false, isError: false, error: null };
const confirmMutationState = { isPending: false, isError: false, error: null };
const resendMutationState = { isPending: false, isError: false, isSuccess: false, error: null };

vi.mock("@mcc/features", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mcc/features")>();
  return {
    ...actual,
    usePasswordReset: () => ({
      requestMutation: {
        ...requestMutationState,
        mutate: mockRequestMutate,
      },
      verifyMutation: {
        ...verifyMutationState,
        mutate: mockVerifyMutate,
      },
      confirmMutation: {
        ...confirmMutationState,
        mutate: mockConfirmMutate,
      },
      resendMutation: {
        ...resendMutationState,
        mutate: mockResendMutate,
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

beforeEach(() => {
  vi.clearAllMocks();
  // reset mutation states
  requestMutationState.isPending = false;
  requestMutationState.isError = false;
  requestMutationState.error = null;
  verifyMutationState.isPending = false;
  verifyMutationState.isError = false;
  verifyMutationState.error = null;
  confirmMutationState.isPending = false;
  confirmMutationState.isError = false;
  confirmMutationState.error = null;
  resendMutationState.isPending = false;
  resendMutationState.isError = false;
  resendMutationState.isSuccess = false;
  resendMutationState.error = null;
});

// ─────────────────────────────────────────────────────────────────────────────
// IT-12.1 — Step 1: email input
// ─────────────────────────────────────────────────────────────────────────────
describe("step 1 — email", () => {
  it("shows the email input on initial render", () => {
    render(<ForgetPassword />, { wrapper: Providers });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send code/i }),
    ).toBeInTheDocument();
  });

  // IT-12.2
  it("transitions to OTP screen after submitting email", async () => {
    // simulate successful request by calling onSuccess
    mockRequestMutate.mockImplementation(
      (_email: string, { onSuccess }: { onSuccess: () => void }) => {
        onSuccess();
      },
    );

    const user = userEvent.setup();
    render(<ForgetPassword />, { wrapper: Providers });

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter the 4 digit code/i)).toBeInTheDocument();
    });
  });

  it("shows error when email request fails", async () => {
    requestMutationState.isError = true;
    requestMutationState.error = {
      response: { data: { message: "Email not found" } },
    } as unknown as null;

    render(<ForgetPassword />, { wrapper: Providers });

    expect(screen.getByText("Email not found")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IT-12.3 — Step 2: OTP verification
// ─────────────────────────────────────────────────────────────────────────────
describe("step 2 — OTP verification", () => {
  async function renderAtOTPStep() {
    mockRequestMutate.mockImplementation(
      (_email: string, { onSuccess }: { onSuccess: () => void }) => onSuccess(),
    );

    const user = userEvent.setup();
    render(<ForgetPassword />, { wrapper: Providers });

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));
    await waitFor(() =>
      expect(screen.getByText(/enter the 4 digit code/i)).toBeInTheDocument(),
    );
    return user;
  }

  it("shows error when OTP is invalid", async () => {
    const user = await renderAtOTPStep();

    verifyMutationState.isError = true;
    verifyMutationState.error = {
      response: { data: { message: "Invalid or expired code" } },
    } as unknown as null;

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "0");
    await user.type(inputs[1], "0");
    await user.type(inputs[2], "0");
    await user.type(inputs[3], "0");

    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired code/i)).toBeInTheDocument();
    });
  });

  // IT-12.4
  it("transitions to new password form after OTP verified", async () => {
    const user = await renderAtOTPStep();

    mockVerifyMutate.mockImplementation(
      (_data: unknown, { onSuccess }: { onSuccess: (token: string) => void }) =>
        onSuccess("vt-abc"),
    );

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "1");
    await user.type(inputs[1], "2");
    await user.type(inputs[2], "3");
    await user.type(inputs[3], "4");

    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/create new password/i)).toBeInTheDocument();
    });
  });
});
