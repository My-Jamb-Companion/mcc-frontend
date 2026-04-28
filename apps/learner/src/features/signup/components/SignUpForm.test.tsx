import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import SignupForm from "./SignUpForm";
import React from "react";

// Define types for the mocked components and hooks
type MockMotionDivProps = {
  children: React.ReactNode;
  layoutId?: string;
} & React.HTMLAttributes<HTMLDivElement>;

type MockMotionButtonProps = {
  children: React.ReactNode;
  layoutId?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type MockIconProps = {
  icon: string;
  width?: string;
  height?: string;
};

// Define a type for the data passed to the onSubmit callback
type MockSubmitFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

// Define a simplified FieldErrors type for the mock, matching its usage in formState.errors
type MockFieldErrors = {
  email?: {message?: string};
  password?: {message?: string};
  confirmPassword?: {message?: string};
};

// Define the structure of the mocked useForm hook's return value
type MockUseFormReturn = {
  register: (name: string) => {name: string};
  formState: {
    errors: MockFieldErrors;
    values: {email: string}; // Mocking the non-standard `values` from formState
  };
  watch: (name: string) => string;
  handleSubmit: (
    callback: (data: MockSubmitFormData) => void,
  ) => (e: React.FormEvent) => void;
};

// Define the props for the mocked FormInputs component
type MockFormInputsProps = {
  label: string;
  type?: string;
  placeholder?: string;
  registration: {name: string};
  errors?: {message?: string};
  isPassword?: boolean;
};

// Mocking @mcc/ui to bypass animation overhead and icon loading issues in JSDOM
vi.mock("@mcc/ui", () => ({
  motion: {
    div: ({children, layoutId, ...props}: MockMotionDivProps) => (
      <div {...props}>{children}</div>
    ),
    button: ({children, layoutId, ...props}: MockMotionButtonProps) => (
      <button {...props}>{children}</button>
    ),
  },
  Icon: ({icon, ...props}: MockIconProps) => (
    <i data-testid="icon" data-icon={icon} {...props} />
  ),
}));

// Mocking next/link
vi.mock("next/link", () => ({
  default: ({children}: {children: React.ReactNode}) => children,
}));
vi.mock("@mcc/features", () => ({
  useForm: (): MockUseFormReturn => ({
    register: vi.fn((name: string) => ({name})),
    formState: {
      errors: {},
      values: {email: "test@example.com"},
    },
    watch: vi.fn((name: string) => {
      if (name === "password") return "password123";
      return "";
    }),
    handleSubmit:
      (callback: (data: MockSubmitFormData) => void) =>
      (e: React.FormEvent) => {
        e.preventDefault();
        callback({
          email: "test@example.com",
          password: "password123",
          confirmPassword: "password123",
        });
      },
  }),
  FormInputs: ({
    label,
    registration,
    errors,
    ...props
  }: MockFormInputsProps) => (
    <div>
      <label>{label}</label>
      <input {...registration} />
      {errors?.message && (
        <span data-testid={`error-${registration.name}`}>{errors.message}</span>
      )}
    </div>
  ),
}));

describe("SignupForm", () => {
  it("renders the signup form correctly", () => {
    render(<SignupForm back={vi.fn()} />);

    expect(screen.getByText("Create an account")).toBeTruthy();
    expect(screen.getByText("Email")).toBeTruthy();
    expect(screen.getByText("Password")).toBeTruthy();
    expect(screen.getByRole("button", {name: /create account/i})).toBeTruthy();
  });

  it("calls the back function when the back link is clicked", () => {
    const backMock = vi.fn();
    render(<SignupForm back={backMock} />);

    fireEvent.click(screen.getByText("Back"));
    expect(backMock).toHaveBeenCalledWith(false);
  });

  it("transitions to email verification view on form submission", async () => {
    render(<SignupForm back={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", {name: /create account/i}));

    expect(screen.getByText(/verify your email/i)).toBeTruthy();
    expect(screen.getByText(/test@example.com/i)).toBeTruthy();
  });
});
