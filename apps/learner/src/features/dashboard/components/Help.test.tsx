// @vitest-environment jsdom
import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import Help from "./Help";
import type {ApiProfile} from "@/src/features/account/services/profile.service";

let profile: ApiProfile | undefined;

vi.mock("@/src/features/account/hooks/useProfile", () => ({useProfile: () => ({data: profile})}));
vi.mock("next/navigation", () => ({useRouter: () => ({push: vi.fn()})}));
vi.mock("next/image", () => ({default: () => null}));

const base: ApiProfile = {user_id: "u", email: "a@b.co", role: "student", is_active: true};
const complete: ApiProfile = {
  ...base,
  full_name: "Ada Obi",
  phone_number: "+2348012345678",
  gender: "Female",
  address: {country: "Nigeria", state: "Lagos", city: "Ikeja"},
  profile_photo_url: "https://x/y.png",
};

afterEach(() => {
  cleanup();
  profile = undefined;
});

describe("the floating Help button", () => {
  it("is not shown while the profile is still loading", () => {
    const {container} = render(<Help />);
    expect(container.firstChild).toBeNull();
  });

  it("is shown while the profile is incomplete", () => {
    profile = {...complete, profile_photo_url: null};
    render(<Help />);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("disappears once the profile is complete", () => {
    profile = complete;
    const {container} = render(<Help />);
    expect(container.firstChild).toBeNull();
  });
});
