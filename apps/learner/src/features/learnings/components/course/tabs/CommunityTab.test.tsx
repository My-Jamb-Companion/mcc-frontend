import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";

const createAsync = vi.fn();
const acceptMutate = vi.fn();
const voteMutate = vi.fn();
const replies = vi.fn();
const reportMutate = vi.fn();
const posts = vi.fn();
const showSuccess = vi.fn();
const showError = vi.fn();

vi.mock("lucide-react", () => ({
  Flag: () => null, Pencil: () => null, Trash2: () => null, ChevronUp: () => null, CheckCircle2: () => null,
  MessageSquare: () => null, Pin: () => null,
}));
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
  useCreatePost: () => ({mutateAsync: createAsync, isPending: false}),
  useReplies: () => replies(),
  useAcceptReply: () => ({mutate: acceptMutate, isPending: false}),
  useVote: () => ({mutate: voteMutate, isPending: false}),
  useGuidelines: () => ({data: {title: "Keep the discussion about learning", rules: ["Ask and answer questions about this course."], consequences: "Posts that break these rules are removed.", accepted: false}, isLoading: false}),
  useAcceptGuidelines: () => ({mutate: (_: unknown, opts: {onSuccess: () => void}) => opts.onSuccess(), isPending: false}),
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
    expect(screen.getByText(/your learners community space/i)).toBeTruthy();
    expect(screen.getByText(/questions and answers about this course, share your knowledge and interact/i)).toBeTruthy();
    expect(screen.getByPlaceholderText("Ask a question, share useful insights and conversations about this course")).toBeTruthy();
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

  it("tells the writer when a post was held for review, instead of letting it look lost", async () => {
    ready([]);
    createAsync.mockResolvedValue({post_id: "p9", status: "held", message: "Your post is waiting for a moderator to review it."});
    render(<CommunityTab courseId="c1" />);
    fireEvent.change(screen.getByLabelText("Write a post"), {target: {value: "some words"}});
    fireEvent.click(screen.getByText("Post"));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith("Your post is waiting for a moderator to review it."));
  });

  it("shows the refusal message (phone number, link, too many posts) as an error and keeps the draft", async () => {
    ready([]);
    createAsync.mockRejectedValue({message: "Please don't share phone numbers"});
    render(<CommunityTab courseId="c1" />);
    fireEvent.change(screen.getByLabelText("Write a post"), {target: {value: "call me"}});
    fireEvent.click(screen.getByText("Post"));
    await waitFor(() => expect(showError).toHaveBeenCalledWith("Please don't share phone numbers"));
    expect((screen.getByLabelText("Write a post") as HTMLTextAreaElement).value).toBe("call me");
  });

  it("shows the guidelines before a first post, then sends the post that was waiting", async () => {
    ready([]);
    const needGuidelines = {response: {data: {error: {code: "GUIDELINES_REQUIRED"}}}};
    createAsync.mockRejectedValueOnce(needGuidelines).mockResolvedValueOnce({post_id: "p1", status: "visible"});
    render(<CommunityTab courseId="c1" />);
    fireEvent.change(screen.getByLabelText("Write a post"), {target: {value: "What is a mole?"}});
    fireEvent.click(screen.getByText("Post"));
    expect(await screen.findByText("Ask and answer questions about this course.")).toBeTruthy();
    fireEvent.click(screen.getByText("I agree"));
    await waitFor(() => expect(createAsync).toHaveBeenCalledTimes(2));
    expect(createAsync).toHaveBeenLastCalledWith({body: "What is a mole?", parentPostId: undefined});
    expect(showError).not.toHaveBeenCalled();
  });

  it("drops the post, quietly, if they say not now to the guidelines", async () => {
    ready([]);
    createAsync.mockRejectedValue({response: {data: {error: {code: "GUIDELINES_REQUIRED"}}}});
    render(<CommunityTab courseId="c1" />);
    fireEvent.change(screen.getByLabelText("Write a post"), {target: {value: "What is a mole?"}});
    fireEvent.click(screen.getByText("Post"));
    fireEvent.click(await screen.findByText("Not now"));
    await waitFor(() => expect(screen.queryByText("I agree")).toBeNull());
    expect(createAsync).toHaveBeenCalledTimes(1);
    expect(showError).not.toHaveBeenCalled();
    expect((screen.getByLabelText("Write a post") as HTMLTextAreaElement).value).toBe("What is a mole?");
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

describe("questions and answers", () => {
  it("lets you switch between newest, top and unanswered", () => {
    ready([]);
    render(<CommunityTab courseId="c1" />);
    expect(screen.getByRole("tab", {name: "Newest"}).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", {name: "Unanswered"}));
    expect(screen.getByRole("tab", {name: "Unanswered"}).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText(/Every question has an answer/)).toBeTruthy();
  });

  it("shows pinned, answered and the teacher's badge", () => {
    ready([post({pinned: true, answered: true, author: {user_id: "t1", full_name: "Mrs Okafor", profile_photo_url: null, badge: "Teacher"}})]);
    render(<CommunityTab courseId="c1" />);
    expect(screen.getByText("Pinned")).toBeTruthy();
    expect(screen.getByText("Answered")).toBeTruthy();
    expect(screen.getByText("Teacher")).toBeTruthy();
  });

  it("votes on a question, but not on your own", () => {
    ready([post({vote_count: 2, i_voted: false})]);
    render(<CommunityTab courseId="c1" />);
    fireEvent.click(screen.getByLabelText("Vote up (2)"));
    expect(voteMutate).toHaveBeenCalledWith({postId: "p1", on: true}, expect.any(Object));
    cleanup();
    ready([post({is_mine: true, vote_count: 2})]);
    render(<CommunityTab courseId="c1" />);
    expect((screen.getByLabelText("Vote up (2)") as HTMLButtonElement).disabled).toBe(true);
  });

  it("takes a vote back when you have already voted", () => {
    ready([post({vote_count: 1, i_voted: true})]);
    render(<CommunityTab courseId="c1" />);
    fireEvent.click(screen.getByLabelText("Remove your vote (1)"));
    expect(voteMutate).toHaveBeenCalledWith({postId: "p1", on: false}, expect.any(Object));
  });

  it("opens the answers under a question, accepted one marked, and lets the asker accept another", () => {
    ready([post({is_mine: true, reply_count: 2})]);
    replies.mockReturnValue({
      isLoading: false, isError: false, error: null, acceptedReplyId: "r1",
      replies: [
        {post_id: "r1", author: {user_id: "t1", full_name: "Mrs Okafor", badge: "Teacher"}, body: "Divide by the smallest.", created_at: new Date().toISOString(), is_accepted: true, vote_count: 3},
        {post_id: "r2", author: {user_id: "u3", full_name: "Chidi"}, body: "Try the ratio.", created_at: new Date().toISOString(), is_accepted: false, vote_count: 0},
      ],
    });
    render(<CommunityTab courseId="c1" />);
    fireEvent.click(screen.getByText("2 answers"));
    expect(screen.getByText("Divide by the smallest.")).toBeTruthy();
    expect(screen.getByText("Accepted answer")).toBeTruthy();
    fireEvent.click(screen.getByText("Accept this answer"));
    expect(acceptMutate).toHaveBeenCalledWith({questionId: "p1", replyId: "r2"}, expect.any(Object));
    fireEvent.click(screen.getByText("Remove accepted answer"));
    expect(acceptMutate).toHaveBeenLastCalledWith({questionId: "p1", replyId: null}, expect.any(Object));
  });

  it("does not offer to accept an answer to someone else's question", () => {
    ready([post({is_mine: false, reply_count: 1})]);
    replies.mockReturnValue({isLoading: false, isError: false, error: null, acceptedReplyId: null,
      replies: [{post_id: "r1", author: {user_id: "u3", full_name: "Chidi"}, body: "Try the ratio.", created_at: new Date().toISOString(), vote_count: 0}]});
    render(<CommunityTab courseId="c1" />);
    fireEvent.click(screen.getByText("1 answer"));
    expect(screen.queryByText("Accept this answer")).toBeNull();
  });

  it("sends an answer as a reply to that question", async () => {
    ready([post({reply_count: 0})]);
    replies.mockReturnValue({isLoading: false, isError: false, error: null, replies: [], acceptedReplyId: null});
    createAsync.mockResolvedValue({post_id: "r9", status: "visible"});
    render(<CommunityTab courseId="c1" />);
    fireEvent.click(screen.getByText("Be first to answer"));
    expect(screen.getByText(/No answers yet/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Write an answer"), {target: {value: "Balance the oxygen last."}});
    fireEvent.click(screen.getByRole("button", {name: "Answer"}));
    await waitFor(() => expect(createAsync).toHaveBeenCalledWith({body: "Balance the oxygen last.", parentPostId: "p1"}));
  });
});
