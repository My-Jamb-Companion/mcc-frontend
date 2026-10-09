// @vitest-environment jsdom
/**
 * The messaging inbox: read what was sent and what came back, open a conversation, reply in it, and
 * start a new message. The service layer is faked; everything above it is real.
 */
import {cleanup, fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import Messaging from "./Messaging";
import * as conversations from "./services/conversations.service";
import * as messages from "./services/messages.service";
import * as recipients from "./services/recipients.service";

vi.mock("@mcc/ui", async (importOriginal) => ({...(await importOriginal<typeof import("@mcc/ui")>()), Icon: () => null}));
vi.mock("./services/conversations.service");
vi.mock("./services/messages.service");
vi.mock("./services/recipients.service");

const sam = {
  user_id: "u-sam", full_name: "Sam Student", email: "sam@example.com", role: "student",
  last_body: "Thanks, see you Tuesday", last_direction: "inbound" as const, last_at: "2026-10-09T09:05:00Z", message_count: 3, unread_count: 2,
};
const tia = {
  user_id: "u-tia", full_name: null, email: "tia@example.com", role: "teacher",
  last_body: "Please confirm your slot", last_direction: "outbound" as const, last_at: "2026-10-01T09:05:00Z", message_count: 1, unread_count: 0,
};

const thread = (over: Record<string, unknown> = {}) => ({
  user: {user_id: "u-sam", full_name: "Sam Student", email: "sam@example.com", role: "student"},
  messages: [
    {message_id: "m1", direction: "outbound", subject: "Welcome", body: "Hello Sam\nGlad you joined", delivered: true, sender_name: "Ada Admin", created_at: "2026-10-08T10:00:00Z", read: true},
    {message_id: "m2", direction: "inbound", subject: null, body: "Thanks, see you Tuesday", delivered: null, sender_name: null, created_at: "2026-10-09T09:05:00Z", read: true},
  ],
  ...over,
});

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}, mutations: {retry: false}}})}>
      <Messaging />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.mocked(conversations.listConversations).mockResolvedValue({items: [sam, tia], total: 2, page: 1, limit: 20, pages: 1});
  vi.mocked(conversations.getConversation).mockResolvedValue(thread() as never);
  vi.mocked(conversations.getUnreadMessageCount).mockResolvedValue(2);
  vi.mocked(messages.sendMessage).mockResolvedValue({message_id: "m3", delivered: true});
  vi.mocked(messages.listMessageTemplates).mockResolvedValue([]);
  vi.mocked(recipients.searchRecipients).mockResolvedValue([]);
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Messaging inbox", () => {
  it("lists conversations with what was said last, and marks what is waiting", async () => {
    renderPage();
    expect(await screen.findByText("Sam Student")).toBeTruthy();
    expect(screen.getByText("Thanks, see you Tuesday")).toBeTruthy();
    expect(screen.getByLabelText("2 unread")).toBeTruthy();
    // No name: the email stands in, and the last message was ours.
    expect(screen.getByText("tia@example.com")).toBeTruthy();
    expect(screen.getByText("You: Please confirm your slot")).toBeTruthy();
  });

  it("opens a conversation and shows both sides, with the team's subject and read state", async () => {
    renderPage();
    fireEvent.click(await screen.findByText("Sam Student"));
    expect(await screen.findByText(/Glad you joined/)).toBeTruthy();
    expect(vi.mocked(conversations.getConversation).mock.calls[0][0]).toBe("u-sam");
    expect(screen.getByText("Welcome")).toBeTruthy();
    expect(screen.getByText(/^Ada Admin ·/)).toBeTruthy();
    expect(screen.getByText(/^Reply ·/)).toBeTruthy();
    expect(screen.getByText("Read")).toBeTruthy();
  });

  it("sends a reply into the open conversation and clears the box", async () => {
    renderPage();
    fireEvent.click(await screen.findByText("Sam Student"));
    const box = await screen.findByLabelText("Reply");
    const send = screen.getByRole("button", {name: "Send reply"});
    expect((send as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(box, {target: {value: "  Tuesday at 6 works for us  "}});
    fireEvent.click(send);
    await waitFor(() => expect(vi.mocked(messages.sendMessage).mock.calls[0][0]).toEqual({recipient_id: "u-sam", body: "Tuesday at 6 works for us"}));
    await waitFor(() => expect((box as HTMLTextAreaElement).value).toBe(""));
  });

  it("filters to the conversations waiting for a reply", async () => {
    renderPage();
    await screen.findByText("Sam Student");
    fireEvent.click(screen.getByLabelText(/Only conversations waiting/));
    await waitFor(() => expect(vi.mocked(conversations.listConversations).mock.calls.some(([f]) => f.unread === true)).toBe(true));
  });

  it("searches once typing pauses", async () => {
    renderPage();
    await screen.findByText("Sam Student");
    fireEvent.change(screen.getByLabelText("Search conversations"), {target: {value: "tia"}});
    await waitFor(() => expect(vi.mocked(conversations.listConversations).mock.calls.some(([f]) => f.q === "tia")).toBe(true));
  });

  it("says so plainly when there is nothing yet, and when a conversation can't be loaded", async () => {
    vi.mocked(conversations.listConversations).mockResolvedValue({items: [], total: 0, page: 1, limit: 20, pages: 1});
    renderPage();
    expect(await screen.findByText(/No conversations yet/)).toBeTruthy();
    cleanup();

    vi.mocked(conversations.listConversations).mockResolvedValue({items: [sam], total: 1, page: 1, limit: 20, pages: 1});
    vi.mocked(conversations.getConversation).mockRejectedValue(new Error("boom"));
    renderPage();
    fireEvent.click(await screen.findByText("Sam Student"));
    expect(await screen.findByText(/couldn't be loaded/)).toBeTruthy();
  });

  it("starts a new message to a chosen person from the dialog", async () => {
    vi.mocked(recipients.searchRecipients).mockResolvedValue([{user_id: "u-tia", full_name: "Tia Teacher", email: "tia@example.com", role: "teacher"}]);
    renderPage();
    await screen.findByText("Sam Student");
    fireEvent.click(screen.getByRole("button", {name: /New message/}));
    const dialog = await screen.findByRole("dialog");
    const search = within(dialog).getByPlaceholderText(/Search a student or teacher/);
    fireEvent.focus(search);
    fireEvent.change(search, {target: {value: "tia"}});
    fireEvent.click(await within(dialog).findByText("Tia Teacher"));
    fireEvent.change(within(dialog).getByLabelText("Subject", {exact: false}), {target: {value: "Your slot"}});
    fireEvent.change(within(dialog).getByLabelText("Message"), {target: {value: "Can you take Tuesday?"}});
    fireEvent.click(within(dialog).getByRole("button", {name: "Send message"}));
    await waitFor(() => expect(vi.mocked(messages.sendMessage).mock.calls[0][0]).toEqual({
      recipient_id: "u-tia", body: "Can you take Tuesday?", subject: "Your slot", template_id: undefined,
    }));
  });
});
