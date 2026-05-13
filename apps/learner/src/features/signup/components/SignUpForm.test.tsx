import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";
import SignupForm from "./SignUpForm";
import React from "react";

// Define types for the mocked components and hooks
type MockMotionDivProps = {
  children: React.ReactNode;
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
  ) => (e: React.FormEvent) => Promise<void>;
  getValues: (name: string) => string;
};

type MockSignupMutation = {
  mutate: (
    data: {email: string; password: string},
    options?: {onSuccess?: () => void},
  ) => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};

type MockUseSignupReturn = {
  signupMutation: MockSignupMutation;
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
    div: ({children, ...props}: MockMotionDivProps) => (
      <div {...props}>{children}</div>
    ),
    button: ({children, ...props}: MockMotionButtonProps) => (
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

const mockSignupMutation: MockSignupMutation = {
  mutate: vi.fn((data, options) => {
    options?.onSuccess?.();
  }),
  isPending: false,
  isError: false,
  error: null,
};

vi.mock("@mcc/features", () => ({
  useSignup: (): MockUseSignupReturn => ({
    signupMutation: mockSignupMutation,
  }),
  useForm: (): MockUseFormReturn => ({
    register: vi.fn((name: string) => ({name})),
    formState: {errors: {}},
    watch: vi.fn(() => "password123"),
    getValues: vi.fn(() => "test@example.com"),
    handleSubmit: vi.fn((callback) => async (e: React.FormEvent) => {
      e.preventDefault();
      await callback({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
    }),
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

vi.mock("@mcc/api", () => ({
  extractApiError: vi.fn((err, fallback) => fallback),
}));

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignupMutation.isPending = false;
    mockSignupMutation.isError = false;
    mockSignupMutation.error = null;
  });

  it("renders the signup form correctly", () => {
    render(<SignupForm back={vi.fn()} />);

    expect(screen.getByText("Create an account")).toBeDefined();
    expect(screen.getByText("Email")).toBeDefined();
    expect(screen.getByText("Password")).toBeDefined();
    expect(screen.getByRole("button", {name: /create account/i})).toBeDefined();
  });

  it("calls the back function when the back link is clicked", () => {
    const backMock = vi.fn();
    render(<SignupForm back={backMock} />);

    fireEvent.click(screen.getByText("Back"));
    expect(backMock).toHaveBeenCalled();
  });

  it("calls signup mutation and transitions to verification view on success", async () => {
    render(<SignupForm back={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", {name: /create account/i}));

    expect(mockSignupMutation.mutate).toHaveBeenCalled();
    expect(screen.getByText(/verify your email/i)).toBeDefined();
    expect(screen.getByText(/test@example.com/i)).toBeDefined();
  });

  it("displays loading state when mutation is pending", () => {
    mockSignupMutation.isPending = true;
    render(<SignupForm back={vi.fn()} />);

    expect(screen.getByText(/creating account\.\.\./i)).toBeDefined();
    expect(
      screen.getByRole("button", {name: /creating account/i}),
    ).toBeDisabled();
  });

  it("displays error message when mutation fails", () => {
    mockSignupMutation.isError = true;
    mockSignupMutation.error = new Error("Sign up failed");
    render(<SignupForm back={vi.fn()} />);

    expect(screen.getByText(/failed to create account/i)).toBeDefined();
  });
});
