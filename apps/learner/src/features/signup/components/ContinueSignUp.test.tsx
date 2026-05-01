import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";
import ContinueWithAccount from "./ContinueSignUp";
import React from "react";

const mockGoogleMutation = {
  mutate: vi.fn(),
  isPending: false,
};

vi.mock("@mcc/features", () => ({
  useGoogleAuth: () => mockGoogleMutation,
}));

interface MockMotionProps {
  children?: React.ReactNode;
  [key: string]: unknown;
}

interface MockIconProps {
  name: string;
  size?: number | string;
}

vi.mock("@mcc/ui", () => ({
  motion: {
    div: ({children, ...props}: MockMotionProps) => (
      <div {...props}>{children}</div>
    ),
    button: ({children, ...props}: MockMotionProps) => (
      <button {...props}>{children}</button>
    ),
    h3: ({children, ...props}: MockMotionProps) => (
      <h3 {...props}>{children}</h3>
    ),
  },
  Icon: ({name, size}: MockIconProps) => (
    <span data-testid="icon" data-name={name} data-size={size} />
  ),
}));

describe("ContinueWithAccount", () => {
  const mockMail = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGoogleMutation.isPending = false;
  });

  it("renders the welcome header correctly", () => {
    render(<ContinueWithAccount mail={mockMail} />);
    expect(screen.getByText("Welcome to MC. Companion")).toBeDefined();
    expect(screen.getByText("Sign in and continue learning")).toBeDefined();
  });

  it("renders all social buttons and handles disabling", () => {
    render(<ContinueWithAccount mail={mockMail} />);

    expect(screen.getByText("Continue with Google")).toBeDefined();
    expect(screen.getByText("Continue with Facebook")).toBeDefined();
    expect(screen.getByText("Continue with WhatsApp")).toBeDefined();

    expect(
      screen.getByText("Continue with Facebook").closest("button"),
    ).toBeDisabled();
    expect(
      screen.getByText("Continue with WhatsApp").closest("button"),
    ).toBeDisabled();
  });

  it("calls Google mutation when Google button is clicked", () => {
    render(<ContinueWithAccount mail={mockMail} />);
    const googleBtn = screen
      .getByText("Continue with Google")
      .closest("button");
    fireEvent.click(googleBtn!);
    expect(mockGoogleMutation.mutate).toHaveBeenCalled();
  });

  it("displays loading state for Google authentication", () => {
    mockGoogleMutation.isPending = true;
    render(<ContinueWithAccount mail={mockMail} />);

    expect(screen.getByText("Redirecting...")).toBeDefined();
    expect(screen.getByText("Redirecting...").closest("button")).toBeDisabled();
  });

  it("calls the mail callback when Continue with Email is clicked", () => {
    render(<ContinueWithAccount mail={mockMail} />);

    const emailBtn = screen.getByText("Continue with Email").closest("button");
    fireEvent.click(emailBtn!);

    expect(mockMail).toHaveBeenCalled();
  });
});
