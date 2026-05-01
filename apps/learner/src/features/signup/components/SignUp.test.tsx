import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import SignUp from "./SignUp";
import React from "react";

vi.mock("./SignUpForm", () => ({
  default: ({back}: {back: () => void}) => (
    <div data-testid="signup-form">
      <button onClick={back}>Back to Continue</button>
    </div>
  ),
}));

vi.mock("./ContinueSignUp", () => ({
  default: ({mail}: {mail: (v: boolean) => void}) => (
    <div data-testid="continue-signup">
      <button onClick={() => mail(true)}>Go to Email Signup</button>
    </div>
  ),
}));

describe("SignUp Wrapper", () => {
  it("shows ContinueWithAccount by default", () => {
    render(<SignUp />);
    expect(screen.getByTestId("continue-signup")).toBeDefined();
    expect(screen.queryByTestId("signup-form")).toBeNull();
  });

  it("toggles between ContinueWithAccount and SignupForm", () => {
    render(<SignUp />);

    // Switch to form
    fireEvent.click(screen.getByText("Go to Email Signup"));
    expect(screen.getByTestId("signup-form")).toBeDefined();
    expect(screen.queryByTestId("continue-signup")).toBeNull();

    // Switch back
    fireEvent.click(screen.getByText("Back to Continue"));
    expect(screen.getByTestId("continue-signup")).toBeDefined();
  });
});
