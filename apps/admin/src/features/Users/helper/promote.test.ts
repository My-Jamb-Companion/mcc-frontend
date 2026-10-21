import {describe, expect, it} from "vitest";
import {canMakeAdmin} from "./promote";

describe("canMakeAdmin", () => {
  it("allows active students and parents", () => {
    expect(canMakeAdmin({role: "student", is_active: true})).toBe(true);
    expect(canMakeAdmin({role: "parent", is_active: true})).toBe(true);
  });

  it("refuses teachers, CRAs and admins, which the server refuses too", () => {
    for (const role of ["teacher", "cra", "admin"]) expect(canMakeAdmin({role, is_active: true})).toBe(false);
  });

  it("refuses a deactivated account", () => {
    expect(canMakeAdmin({role: "student", is_active: false})).toBe(false);
  });
});
