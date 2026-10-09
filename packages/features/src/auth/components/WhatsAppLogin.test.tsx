/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { WhatsAppLogin } from "./WhatsAppLogin";
import * as authService from "../services/auth.service";
import { useAuthStore } from "@mcc/store";

vi.mock("../services/auth.service", () => ({
  requestWhatsAppOtpApi: vi.fn(),
  verifyWhatsAppOtpApi: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

const user = { user_id: "u1", email: null, role: "student", is_onboarded: false };

describe("WhatsAppLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, accessToken: null });
  });

  it("sends the code to the number in international form, then logs in with it", async () => {
    vi.mocked(authService.requestWhatsAppOtpApi).mockResolvedValue();
    vi.mocked(authService.verifyWhatsAppOtpApi).mockResolvedValue({
      access_token: "a", refresh_token: "r", token_type: "bearer", expires_in: 3600, user,
    } as never);
    const onSuccess = vi.fn();
    render(<WhatsAppLogin onSuccess={onSuccess} />, { wrapper });
    const u = userEvent.setup();

    await u.type(screen.getByPlaceholderText("0801 234 5678"), "08012345678");
    await u.click(screen.getByRole("button", { name: "Send code" }));
    await waitFor(() => expect(vi.mocked(authService.requestWhatsAppOtpApi).mock.calls[0][0]).toBe("+2348012345678"));

    const code = await screen.findByLabelText("6-digit code");
    expect(screen.getByRole("button", { name: "Log in" })).toBeDisabled();
    await u.type(code, "123456");
    await u.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(user));
    expect(vi.mocked(authService.verifyWhatsAppOtpApi).mock.calls[0].slice(0, 2)).toEqual(["+2348012345678", "123456"]);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it("rejects an impossible number without calling the API", async () => {
    render(<WhatsAppLogin />, { wrapper });
    const u = userEvent.setup();
    await u.type(screen.getByPlaceholderText("0801 234 5678"), "0801");
    await u.click(screen.getByRole("button", { name: "Send code" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("valid phone number");
    expect(authService.requestWhatsAppOtpApi).not.toHaveBeenCalled();
  });

  it("lets the person change the number from the code step", async () => {
    vi.mocked(authService.requestWhatsAppOtpApi).mockResolvedValue();
    render(<WhatsAppLogin />, { wrapper });
    const u = userEvent.setup();
    await u.type(screen.getByPlaceholderText("0801 234 5678"), "08012345678");
    await u.click(screen.getByRole("button", { name: "Send code" }));
    await u.click(await screen.findByRole("button", { name: "Change number" }));
    expect(screen.getByPlaceholderText("0801 234 5678")).toBeInTheDocument();
  });
});
