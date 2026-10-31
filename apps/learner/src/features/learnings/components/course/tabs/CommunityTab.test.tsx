import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";

const createMutate = vi.fn();
const reportMutate = vi.fn();
const posts = vi.fn();
const showSuccess = vi.fn();
const showError = vi.fn();

vi.mock("lucide-react", () => ({Flag: () => null, Pencil: () => null, Trash2: () => null}));
vi.mock("@mcc/ui", () => ({
  Button: ({children, onClick, disabled}: {children: React.ReactNode; onClick?: () => void; disabled?: boolean}) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  ConfirmModal: ({trigger}: {trigger: React.ReactNode}) => <>{trigger}</>,
  Modal: ({open, title, children}: {open: boolean; title: string; children: React.ReactNode}) =>
    open ? <div role="dialog" aria-label={title}>{children}</div> : null,
  showSuccess: (m: string) => showSuccess(m),
  showError: (m: string) => showError(m),
}));
vi.mock("@mcc/api", () => ({extractApiError: (e: {message?: string}, fallback: string) => e?.message ?? fallback}));
vi.mock("@/src/features/learnings/hooks/useCommunity", () => ({
  useCommunityPosts: () => posts(),
  useCreatePost: () => ({mutate: createMutate, isPending: false}),
  useUpdatePost: () => ({mutate: vi.fn(), isPending: false}),
  useDeletePost: () => ({mutate: vi.fn(), isPending: false}),
  useReportPost: () => ({mutate: reportMutate, isPending: false}),
}));

import CommunityTab from "./CommunityTab";

const post = (over = {}) => ({
  post_id: "p1",
  author: {user_id: "u2", full_name: "Bola Ade", profile_photo_url: null},
  body: "How do I balance this equation?",
  reply_count: 0,
  created_at: new Date().toISOString(),
  status: "visible",
  is_mine: false,
  can_edit: false,
  edited: false,
  ...over,
});

const ready = (list: unknown[]) => posts.mockReturnValue({posts: list, isLoading: false, isError: false, error: null});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CommunityTab", () => {
  it("tells people what the space is for before they write", () => {
    ready([]);
    render(<CommunityTab courseId="c1" />);
    expect(screen.getByText(/questions and answers about this course/i)).toBeTruthy();
    expect(screen.getByText(/phone numbers, links or social handles/i)).toBeTruthy();
  });

  it("shows the server's message when someone outside the course opens it", () => {
    posts.mockReturnValue({posts: [], isLoading: false, isError: true, error: {message: "Enrol in this course to join its discussion"}});
    render(<CommunityTab courseId="c1" />);
    expect(screen.getByRole("alert").textContent).toContain("Enrol in this course");
    expect(screen.queryByText(/No posts yet/)).toBeNull();
  });

  it("shows a counter near the limit and stops the post when it is too long", () => {
    ready([]);
    render(<CommunityTab courseId="c1" />);
    const box = screen.getByLabelText("Write a post") as HTMLTextAreaElement;
    fireEvent.change(box, {target: {value: "a".repeat(100)}});
    expect(screen.queryByText(/\/ 2000/)).toBeNull();
    fireEvent.change(box, {target: {value: "a".repeat(1600)}});
    expect(screen.getByText("1600 / 2000")).toBeTruthy();
    fireEvent.change(box, {target: {value: "a".repeat(2001)}});
    expect((screen.getByText("Post") as HTMLButtonElement).disabled).toBe(true);
  });

  it("tells the writer when a post was held for review, instead of letting it look lost", () => {
    ready([]);
    createMutate.mockImplementation((_body, opts) => opts.onSuccess({post_id: "p9", status: "held", message: "Your post is waiting for a moderator to review it."}));
    render(<CommunityTab courseId="c1" />);
    fireEvent.change(screen.getByLabelText("Write a post"), {target: {value: "some words"}});
    fireEvent.click(screen.getByText("Post"));
    expect(showSuccess).toHaveBeenCalledWith("Your post is waiting for a moderator to review it.");
  });

  it("shows the refusal message (phone number, link, too many posts) as an error", () => {
    ready([]);
    createMutate.mockImplementation((_body, opts) => opts.onError({message: "Please don't share phone numbers"}));
    render(<CommunityTab courseId="c1" />);
    fireEvent.change(screen.getByLabelText("Write a post"), {target: {value: "call me"}});
    fireEvent.click(screen.getByText("Post"));
    expect(showError).toHaveBeenCalledWith("Please don't share phone numbers");
  });

  it("lets people report someone else's post, with a reason a moderator can use", () => {
    ready([post()]);
    render(<CommunityTab courseId="c1" />);
    fireEvent.click(screen.getByText("Report"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect((screen.getByText("Send report") as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByLabelText("Exam leak or cheating"));
    fireEvent.click(screen.getByText("Send report"));
    expect(reportMutate).toHaveBeenCalledWith({postId: "p1", reason: "Exam leak or cheating"}, expect.any(Object));
  });

  it("gives you edit and delete on your own post, and no report button", () => {
    ready([post({is_mine: true, can_edit: true})]);
    render(<CommunityTab courseId="c1" />);
    expect(screen.getByText("Edit")).toBeTruthy();
    expect(screen.getByText("Delete")).toBeTruthy();
    expect(screen.queryByText("Report")).toBeNull();
  });

  it("drops Edit once the 15 minutes are up but keeps Delete", () => {
    ready([post({is_mine: true, can_edit: false})]);
    render(<CommunityTab courseId="c1" />);
    expect(screen.queryByText("Edit")).toBeNull();
    expect(screen.getByText("Delete")).toBeTruthy();
  });

  it("marks your own held post as waiting for review, and offers no report on it", () => {
    ready([post({is_mine: true, status: "held"})]);
    render(<CommunityTab courseId="c1" />);
    expect(screen.getByRole("status").textContent).toContain("Waiting for a moderator");
    expect(screen.queryByText("Report")).toBeNull();
  });

  it("marks an edited post", () => {
    ready([post({edited: true})]);
    render(<CommunityTab courseId="c1" />);
    expect(screen.getByText(/edited/)).toBeTruthy();
  });
});
