import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";
import EmailVerify from "./EmailVerify";
import React from "react";

// Mocking @mcc/ui to avoid icon loading issues in JSDOM
vi.mock("@mcc/ui", () => ({
  Icon: ({name}: {name: string}) => <i data-testid="icon" data-name={name} />,
}));

const mockResendMutation = {
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
};

vi.mock("@mcc/features", () => ({
  useSignup: () => ({
    resendMutation: mockResendMutation,
  }),
}));

vi.mock("@mcc/api", () => ({
  extractApiError: vi.fn((err, fallback) => fallback),
}));

describe("EmailVerify", () => {
  const testEmail = "learner@example.com";

  beforeEach(() => {
    vi.clearAllMocks();
    mockResendMutation.isPending = false;
    mockResendMutation.isError = false;
    mockResendMutation.isSuccess = false;
    mockResendMutation.error = null;
  });

  it("renders the verification message with the correct email", () => {
    render(<EmailVerify email={testEmail} />);

    expect(screen.getByText(/verify your email/i)).toBeDefined();
    expect(screen.getByText(testEmail, {exact: false})).toBeDefined();
    expect(screen.getByText(/we sent you a verification email/i)).toBeDefined();
  });

  it("calls resend mutation when the resend link is clicked", () => {
    render(<EmailVerify email={testEmail} />);

    const resendLink = screen.getByText(/resend verification email/i);
    fireEvent.click(resendLink);

    expect(mockResendMutation.mutate).toHaveBeenCalledWith(testEmail);
  });

  it("displays loading state while resending", () => {
    mockResendMutation.isPending = true;
    render(<EmailVerify email={testEmail} />);

    expect(screen.getByText(/resending\.\.\./i)).toBeDefined();
  });

  it("displays success message when resend is successful", () => {
    mockResendMutation.isSuccess = true;
    render(<EmailVerify email={testEmail} />);

    expect(
      screen.getByText(/verification link resent successfully/i),
    ).toBeDefined();
  });

  it("displays error message when resend fails", () => {
    mockResendMutation.isError = true;
    mockResendMutation.error = new Error("Failed");
    render(<EmailVerify email={testEmail} />);

    expect(
      screen.getByText(/could not resend verification email/i),
    ).toBeDefined();
  });

  it("renders action buttons and links", () => {
    render(<EmailVerify email={testEmail} />);

    expect(screen.getByRole("button", {name: /open email app/i})).toBeDefined();
    const loginLink = screen.getByRole("link", {name: /back to login/i});
    expect(loginLink.getAttribute("href")).toBe("/login");
  });
});
