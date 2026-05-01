import {render, screen} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {RoleLayout} from "./RoleLayout";
import React from "react";

const mockUseAuth = vi.fn();

vi.mock("@mcc/features", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("RoleLayout", () => {
  it("renders children if user role is allowed", () => {
    mockUseAuth.mockReturnValue({user: {role: "LEARNER"}});

    render(
      <RoleLayout allowedRoles={["LEARNER", "ADMIN"]}>
        <div data-testid="protected-content">Secret Content</div>
      </RoleLayout>,
    );

    expect(screen.getByTestId("protected-content")).toBeDefined();
    expect(screen.queryByText(/unauthorized/i)).toBeNull();
  });

  it("renders 'Unauthorized' if user role is not in the allowed list", () => {
    mockUseAuth.mockReturnValue({user: {role: "GUEST"}});

    render(
      <RoleLayout allowedRoles={["LEARNER", "ADMIN"]}>
        <div data-testid="protected-content">Secret Content</div>
      </RoleLayout>,
    );

    expect(screen.getByText(/unauthorized/i)).toBeDefined();
    expect(screen.queryByTestId("protected-content")).toBeNull();
  });

  it("renders 'Unauthorized' if no user is authenticated", () => {
    mockUseAuth.mockReturnValue({user: null});

    render(
      <RoleLayout allowedRoles={["LEARNER"]}>
        <div data-testid="protected-content">Secret Content</div>
      </RoleLayout>,
    );

    expect(screen.getByText(/unauthorized/i)).toBeDefined();
  });
});
