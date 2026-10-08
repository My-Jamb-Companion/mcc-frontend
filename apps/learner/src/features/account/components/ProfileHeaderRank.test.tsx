import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";

vi.mock("@mcc/ui", () => ({Icon: () => null}));
vi.mock("./ProfileAvatar", () => ({default: () => null}));

import ProfileHeader from "./ProfileHeader";
import type {ProfileUser} from "../constants/types";

const user = (rank: number) =>
  ({displayName: "Ada", username: "ada", points: 40, diamonds: 3, coins: 1, lessons: 2, rank, avatar: ""}) as unknown as ProfileUser;

afterEach(cleanup);

describe("Profile header rank", () => {
  it("shows the student's real rank, not a fixed #1", () => {
    render(<ProfileHeader user={user(7)} avatar="" setFile={() => {}} />);
    expect(screen.getByText("#7")).toBeTruthy();
    expect(screen.queryByText("#1")).toBeNull();
  });

  it("shows no rank badge for someone who isn't ranked yet", () => {
    render(<ProfileHeader user={user(0)} avatar="" setFile={() => {}} />);
    expect(screen.queryByText(/^#/)).toBeNull();
  });
});
