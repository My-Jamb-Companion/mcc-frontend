/// <reference types="@testing-library/jest-dom" />
import {describe, it, expect, vi, beforeEach} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type {ReactNode} from "react";
import {SupportThread} from "./SupportThread";
import {SupportLink} from "./SupportLink";
import * as service from "./support.service";

vi.mock("./support.service", () => ({
  getSupportThread: vi.fn(),
  sendSupportMessage: vi.fn(),
  getSupportUnread: vi.fn(),
}));

const wrapper = ({children}: {children: ReactNode}) => (
  <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}, mutations: {retry: false}}})}>
    {children}
  </QueryClientProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe("SupportThread", () => {
  it("shows what the team sent and what you wrote, with the team's subject", async () => {
    vi.mocked(service.getSupportThread).mockResolvedValue({
      unread: 1,
      messages: [
        {message_id: "1", direction: "outbound", subject: "Welcome", body: "Hello Sam", sender_name: "Ada Admin", created_at: "2026-10-01T10:00:00Z", read: false},
        {message_id: "2", direction: "inbound", subject: null, body: "Thanks!\nSee you", sender_name: null, created_at: "2026-10-01T10:05:00Z", read: true},
      ],
    });
    render(<SupportThread />, {wrapper});
    expect(await screen.findByText("Hello Sam")).toBeInTheDocument();
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText(/^Ada Admin ·/)).toBeInTheDocument();
    expect(screen.getByText(/^You ·/)).toBeInTheDocument();
    expect(screen.getByText(/Thanks!/)).toBeInTheDocument();
  });

  it("invites a first message when there is none, and sends a trimmed one", async () => {
    vi.mocked(service.getSupportThread).mockResolvedValue({messages: [], unread: 0});
    vi.mocked(service.sendSupportMessage).mockResolvedValue({message_id: "3"});
    render(<SupportThread />, {wrapper});
    expect(await screen.findByText(/No messages yet/)).toBeInTheDocument();
    const send = screen.getByRole("button", {name: "Send"});
    expect(send).toBeDisabled();
    const u = userEvent.setup();
    await u.type(screen.getByLabelText("Message to the MCC team"), "  Can I change my class time?  ");
    await u.click(send);
    await waitFor(() => expect(vi.mocked(service.sendSupportMessage).mock.calls[0][0]).toBe("Can I change my class time?"));
    await waitFor(() => expect(screen.getByLabelText("Message to the MCC team")).toHaveValue(""));
  });

  it("does not claim there are no messages while a failed load is being retried", async () => {
    vi.mocked(service.getSupportThread).mockRejectedValue(new Error("down"));
    const retrying = ({children}: {children: ReactNode}) => (
      <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: 3, retryDelay: 60_000}}})}>{children}</QueryClientProvider>
    );
    render(<SupportThread />, {wrapper: retrying});
    await waitFor(() => expect(service.getSupportThread).toHaveBeenCalledTimes(1));
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText(/No messages yet/)).toBeNull();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("offers a retry when the messages can't be loaded", async () => {
    vi.mocked(service.getSupportThread).mockRejectedValue(new Error("down"));
    render(<SupportThread />, {wrapper});
    expect(await screen.findByText(/couldn't be loaded/)).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Try again"})).toBeInTheDocument();
  });
});

describe("SupportLink", () => {
  it("shows the unread count only when there is one", async () => {
    vi.mocked(service.getSupportUnread).mockResolvedValue(3);
    render(<SupportLink />, {wrapper});
    expect(await screen.findByLabelText("3 unread")).toBeInTheDocument();
  });

  it("shows just the label when nothing is unread", async () => {
    vi.mocked(service.getSupportUnread).mockResolvedValue(0);
    render(<SupportLink label="Messages" />, {wrapper});
    await waitFor(() => expect(service.getSupportUnread).toHaveBeenCalled());
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.queryByLabelText(/unread/)).toBeNull();
  });
});
