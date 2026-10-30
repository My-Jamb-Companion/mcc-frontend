import {describe, expect, it} from "vitest";
import {fromApiActiveStudent} from "./student.mapper";
import type {ApiActiveStudent} from "../services/student.service";

const base: ApiActiveStudent = {
  user_id: "u1",
  full_name: "Ada Obi",
  email: "ada@example.com",
  program_enrolled: "Maths",
  program_description: "",
  date_joined: "2026-06-01T09:00:00Z",
  location: "Lagos",
};

describe("fromApiActiveStudent last login", () => {
  it("formats the last login date and time", () => {
    const s = fromApiActiveStudent({...base, last_login_at: "2026-07-09T10:30:00Z"});
    expect(s.lastLogin).toContain("2026");
    expect(s.lastLoginTime).not.toBe("");
  });

  it("shows a dash and no time when the student has never logged in", () => {
    const s = fromApiActiveStudent({...base, last_login_at: null});
    expect(s.lastLogin).toBe("—");
    expect(s.lastLoginTime).toBe("");
  });

  it("tolerates a backend that does not send the field", () => {
    expect(fromApiActiveStudent(base).lastLogin).toBe("—");
  });
});
