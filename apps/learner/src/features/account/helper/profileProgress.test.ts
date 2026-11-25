import {describe, expect, it} from "vitest";
import {isProfileComplete, profileSteps} from "./profileProgress";
import type {ApiProfile} from "../services/profile.service";

const base: ApiProfile = {user_id: "u", email: "a@b.co", role: "student", is_active: true};
const done = (p?: ApiProfile | null) => profileSteps(p).map((s) => s.done);

describe("profileSteps", () => {
  it("has nothing ticked for a new or missing profile", () => {
    expect(done(base)).toEqual([false, false, false]);
    expect(done(null)).toEqual([false, false, false]);
  });

  it("ticks personal details only when name, phone and gender are all there", () => {
    expect(done({...base, full_name: "Ada Obi", phone_number: "+2348012345678"})).toEqual([false, false, false]);
    expect(done({...base, full_name: "Ada Obi", phone_number: "+2348012345678", gender: "Female"})).toEqual([true, false, false]);
  });

  it("ticks the location when country, state and city are set, and ignores blanks", () => {
    expect(done({...base, address: {country: "Nigeria", state: "Lagos", city: "  "}})).toEqual([false, false, false]);
    expect(done({...base, address: {country: "Nigeria", state: "Lagos", city: "Ikeja"}})).toEqual([false, true, false]);
  });

  it("ticks the photo when there is one", () => {
    expect(done({...base, profile_photo_url: "https://x/y.png"})).toEqual([false, false, true]);
  });
});

describe("isProfileComplete", () => {
  const complete: ApiProfile = {
    ...base,
    full_name: "Ada Obi",
    phone_number: "+2348012345678",
    gender: "Female",
    address: {country: "Nigeria", state: "Lagos", city: "Ikeja"},
    profile_photo_url: "https://x/y.png",
  };

  it("is true only when all three steps are done", () => {
    expect(isProfileComplete(complete)).toBe(true);
    expect(isProfileComplete({...complete, profile_photo_url: null})).toBe(false);
    expect(isProfileComplete({...complete, address: {country: "Nigeria", state: "Lagos"}})).toBe(false);
    expect(isProfileComplete({...complete, gender: ""})).toBe(false);
  });

  it("is false for a missing profile", () => {
    expect(isProfileComplete(null)).toBe(false);
    expect(isProfileComplete(undefined)).toBe(false);
  });
});
