import {describe, expect, it} from "vitest";
import {asEdition, emptyTemplateForm, teachingCostPerStudent, templateInput, validateTemplate} from "./templateForm";

const filled = () => ({
  ...emptyTemplateForm("course"),
  liveSessions: "16",
  hoursPerSession: "1",
  hourlyRate: "15000",
  developmentCost: "0",
  periods: "1",
  enrolmentsPerPeriod: "100",
  directCosts: [],
});

describe("pricing formats", () => {
  it("reads the old edition names from existing links", () => {
    expect(asEdition("standard")).toBe("group");
    expect(asEdition("premium")).toBe("one_to_one");
    expect(asEdition("self_paced")).toBe("self_paced");
    expect(asEdition("gold")).toBeNull();
  });

  it("needs the teacher's pay only when there are live sessions", () => {
    const selfPaced = {...filled(), liveSessions: "0", hourlyRate: ""};
    expect(validateTemplate(selfPaced).hourlyRate).toBeUndefined();
    expect(validateTemplate({...filled(), hourlyRate: ""}).hourlyRate).toBeDefined();
  });

  it("splits a session's cost five ways for a group and not at all for 1-to-1", () => {
    const form = filled();
    expect(teachingCostPerStudent(form, "one_to_one")).toBe(240000);
    expect(teachingCostPerStudent(form, "group")).toBe(48000);
    expect(teachingCostPerStudent(form, "self_paced")).toBe(0);
    expect(teachingCostPerStudent({...form, liveSessions: "0"}, "group")).toBeNull();
  });

  it("sends a ceiling per format, dropping live ones when there are no live sessions", () => {
    const form = {...filled(), ceilings: {self_paced: "8,500", group: "40000", one_to_one: ""}};
    expect(templateInput(form).market_ceilings).toEqual({self_paced: "8500", group: "40000", one_to_one: null});
    expect(templateInput({...form, liveSessions: "0"}).market_ceilings).toEqual({self_paced: "8500", group: null, one_to_one: null});
  });

  it("rejects a ceiling that isn't a positive price", () => {
    const errors = validateTemplate({...filled(), ceilings: {self_paced: "0", group: "abc", one_to_one: ""}});
    expect(errors["ceiling-self_paced"]).toBeDefined();
    expect(errors["ceiling-group"]).toBeDefined();
    expect(errors["ceiling-one_to_one"]).toBeUndefined();
  });
});
