import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";

const useLeaderboard = vi.fn();

vi.mock("lucide-react", () => ({ChevronDown: () => null, Coins: () => null, Trophy: () => null}));
vi.mock("./hooks/useRewards", () => ({
  useLeaderboard: (filters: unknown) => useLeaderboard(filters),
  useMyLeaderboardStanding: () => ({data: {rank: 2, total_score: 30}}),
  useLeaderboardStatus: () => ({data: {percentile: 70, can_claim: true, prize_gems: 25, min_percentile: 60, status_message: "This week you're ahead of 70% of other learners"}}),
  useGamificationRules: () => ({data: {quiz_completion: 10, daily_quiz_points_cap: 100, some_new_rule: 3}}),
}));
vi.mock("../account/hooks/useProfile", () => ({useProfile: () => ({data: {full_name: "Ada", profile_photo_url: null}})}));
vi.mock("@/src/features/exams/hooks/useExams", () => ({
  useEnrolledPrograms: () => ({data: [{program_id: "p1", exam_name: "JAMB", subject_name: "English"}]}),
}));

import Leaderboard from "./LeaderBoard";

const rows = [
  {rank: 1, user: "Bola", score: 50, photo: null, is_me: false},
  {rank: 2, user: "Ada", score: 30, photo: null, is_me: true},
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Leaderboard", () => {
  it("highlights the student's own row", () => {
    useLeaderboard.mockReturnValue({entries: rows, isLoading: false, isError: false});
    render(<Leaderboard />);
    const mine = screen.getAllByText("Ada").map((n) => n.closest('[aria-current="true"]')).find(Boolean);
    expect(mine).toBeTruthy();
    expect(screen.getByText("You")).toBeTruthy();
    expect(screen.getByText("Bola").closest('[aria-current="true"]')).toBeNull();
  });

  it("starts on all time and everyone, and re-asks when the filters change", () => {
    useLeaderboard.mockReturnValue({entries: rows, isLoading: false, isError: false});
    render(<Leaderboard />);
    expect(useLeaderboard).toHaveBeenLastCalledWith({period: "all", scope: "everyone"});

    fireEvent.click(screen.getByRole("button", {name: "This week"}));
    expect(useLeaderboard).toHaveBeenLastCalledWith({period: "week", scope: "everyone"});

    fireEvent.change(screen.getByLabelText("Location"), {target: {value: "country"}});
    expect(useLeaderboard).toHaveBeenLastCalledWith({period: "week", scope: "country"});

    fireEvent.change(screen.getByLabelText("Program"), {target: {value: "p1"}});
    expect(useLeaderboard).toHaveBeenLastCalledWith({period: "week", scope: "country", programId: "p1"});

    fireEvent.change(screen.getByLabelText("Program"), {target: {value: ""}});
    expect(useLeaderboard).toHaveBeenLastCalledWith({period: "week", scope: "country", programId: undefined});
  });

  it("explains an empty location view instead of showing a blank list", () => {
    useLeaderboard.mockReturnValue({entries: [], isLoading: false, isError: false});
    render(<Leaderboard />);
    fireEvent.change(screen.getByLabelText("Location"), {target: {value: "state"}});
    expect(screen.getByText(/Check your state is set in your account/)).toBeTruthy();
  });

  it("says when the leaderboard can't be loaded", () => {
    useLeaderboard.mockReturnValue({entries: [], isLoading: false, isError: true});
    render(<Leaderboard />);
    expect(screen.getByText(/Couldn't load the leaderboard/)).toBeTruthy();
  });

  it("tells the student about this week's prize, and where to claim it", () => {
    useLeaderboard.mockReturnValue({entries: rows, isLoading: false, isError: false});
    render(<Leaderboard />);
    expect(screen.getByText(/weekly prize of 25 gems is ready: claim it on the Rewards tab/)).toBeTruthy();
  });

  it("lists the real rules, and names a rule it doesn't know by its key", () => {
    useLeaderboard.mockReturnValue({entries: rows, isLoading: false, isError: false});
    render(<Leaderboard />);
    fireEvent.click(screen.getByRole("button", {name: /How points work/}));
    expect(screen.getByText("Pass a quiz or test (50% or more)")).toBeTruthy();
    expect(screen.getByText("Most quiz points you can earn in a day")).toBeTruthy();
    expect(screen.getByText("some new rule")).toBeTruthy();
    expect(screen.queryByText("Log in each day")).toBeNull();
  });
});
