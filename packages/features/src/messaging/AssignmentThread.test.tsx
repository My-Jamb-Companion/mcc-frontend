/// <reference types="@testing-library/jest-dom" />
import {describe, it, expect, vi, beforeEach} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type {ReactNode} from "react";
import {AssignmentThread} from "./AssignmentThread";
import * as service from "./assignmentMessages.service";

vi.mock("./assignmentMessages.service", () => ({
  getAssignmentThread: vi.fn(),
  postAssignmentMessage: vi.fn(),
}));

const wrapper = ({children}: {children: ReactNode}) => (
  <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}, mutations: {retry: false}}})}>
    {children}
  </QueryClientProvider>
);

describe("AssignmentThread", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows both sides of the conversation, mine labelled You", async () => {
    vi.mocked(service.getAssignmentThread).mockResolvedValue([
      {message_id: "1", sender_role: "student", body: "Hello", created_at: "2026-10-01T10:00:00Z"},
      {message_id: "2", sender_role: "cra", body: "Welcome aboard", created_at: "2026-10-01T10:05:00Z"},
    ]);
    render(<AssignmentThread assignmentId="a1" self="student" otherLabel="Your coordinator" />, {wrapper});
    expect(await screen.findByText("Welcome aboard")).toBeInTheDocument();
    expect(screen.getByText(/^You ·/)).toBeInTheDocument();
    expect(screen.getByText(/^Your coordinator ·/)).toBeInTheDocument();
  });

  it("sends a trimmed message and clears the box", async () => {
    vi.mocked(service.getAssignmentThread).mockResolvedValue([]);
    vi.mocked(service.postAssignmentMessage).mockResolvedValue({message_id: "3"});
    render(<AssignmentThread assignmentId="a1" self="cra" otherLabel="Student" />, {wrapper});
    const u = userEvent.setup();
    expect(await screen.findByText(/No messages yet/)).toBeInTheDocument();
    const send = screen.getByRole("button", {name: "Send"});
    expect(send).toBeDisabled();
    await u.type(screen.getByLabelText("Message"), "  Can you do Tuesday?  ");
    await u.click(send);
    await waitFor(() => expect(vi.mocked(service.postAssignmentMessage).mock.calls[0].slice(0, 2)).toEqual(["a1", "Can you do Tuesday?"]));
    await waitFor(() => expect(screen.getByLabelText("Message")).toHaveValue(""));
  });
});
