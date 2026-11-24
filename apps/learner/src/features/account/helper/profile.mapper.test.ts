import {describe, expect, it} from "vitest";
import {displayName, fromApiProfile, initialsOf, locationLine} from "./profile.mapper";

describe("displayName", () => {
  it("prefers the full name, then the nickname, then the email name", () => {
    expect(displayName({full_name: " Ada Obi ", username: "ada", email: "ada@x.com"})).toBe("Ada Obi");
    expect(displayName({full_name: "", username: "Demo4 Learner", email: "l@x.com"})).toBe("Demo4 Learner");
    expect(displayName({full_name: null, username: null, email: "learner4@x.com"})).toBe("learner4");
  });

  it("never returns an empty name", () => {
    expect(displayName({})).toBe("Student");
    expect(displayName({full_name: "  ", username: " ", email: ""})).toBe("Student");
  });
});

describe("initialsOf", () => {
  it("uses first and last initials, or two letters of a single name", () => {
    expect(initialsOf("Ada Obi")).toBe("AO");
    expect(initialsOf("Ada Grace Obi")).toBe("AO");
    expect(initialsOf("demo4")).toBe("DE");
    expect(initialsOf("  ")).toBe("?");
  });
});

describe("locationLine", () => {
  it("leaves blanks out, so an empty address is empty rather than ', ,'", () => {
    expect(locationLine({})).toBe("");
    expect(locationLine({city: "", state: "", country: "Nigeria"})).toBe("Nigeria");
    expect(locationLine({city: "Ikeja", state: "Lagos", country: "Nigeria"})).toBe("Ikeja, Lagos, Nigeria");
  });
});

describe("fromApiProfile phone and country", () => {
  const base = {user_id: "u", email: "a@b.co", role: "student", is_active: true};

  it("splits a stored international number into its country and the rest", () => {
    const user = fromApiProfile({...base, phone_number: "+233241234567", address: {country: "Ghana"}});
    expect(user.phoneCountry).toBe("GH");
    expect(user.phoneNumber).toBe("241234567");
  });

  it("shows a number saved before codes were kept as it is, under the learner's country", () => {
    const user = fromApiProfile({...base, phone_number: "0241234567", address: {country: "Ghana"}});
    expect(user.phoneCountry).toBe("GH");
    expect(user.phoneNumber).toBe("0241234567");
  });

  it("defaults to Nigeria when there is nothing to go on", () => {
    expect(fromApiProfile(base).phoneCountry).toBe("NG");
  });
});
