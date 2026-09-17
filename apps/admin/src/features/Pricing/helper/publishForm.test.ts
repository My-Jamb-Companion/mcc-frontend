import {describe, expect, it} from "vitest";
import {completeOverrides, overrideError, publishInput, publishProblems} from "./publishForm";
import type {ApiProposal} from "../services/publications.service";

const proposal = (patch: Partial<ApiProposal> = {}): ApiProposal => ({
  template_version: 3,
  parameter_version: 2,
  tier_revision: 5,
  active_publication: 1,
  pending_publication: null,
  flat_price: "40000.00",
  hard_floor_student_pays: "26300.00",
  market_ceiling: "50000.00",
  max_price_increase_rate: "0.15000",
  weighted_multiplier: "1.0025000",
  tiers: [],
  blockers: [],
  phase_in_reason_required: false,
  below_cost_reason_required: false,
  second_admin_required: false,
  changes_prices: true,
  ...patch,
});

const reasons = {change: "New term prices", phaseIn: "", belowCost: ""};

describe("overrides", () => {
  it("ignores a tier with no override price", () => {
    expect(overrideError(undefined)).toBeUndefined();
    expect(overrideError({price: "  ", reason: ""})).toBeUndefined();
    expect(completeOverrides({t1: {price: "", reason: "anything"}})).toEqual([]);
  });

  it("needs a positive price with at most two decimals and a reason", () => {
    expect(overrideError({price: "0", reason: "Scholarship"})).toMatch(/above 0/);
    expect(overrideError({price: "12.345", reason: "Scholarship"})).toMatch(/above 0/);
    expect(overrideError({price: "30000", reason: "no"})).toMatch(/why/);
    expect(overrideError({price: "30,000", reason: "Scholarship"})).toBeUndefined();
  });

  it("sends only complete overrides, with commas stripped", () => {
    expect(
      completeOverrides({
        t1: {price: "30,000", reason: " Scholarship pilot "},
        t2: {price: "31000", reason: ""},
      }),
    ).toEqual([{tier_id: "t1", price: "30000", reason: "Scholarship pilot"}]);
  });
});

describe("publishProblems", () => {
  it("is clear when the proposal is publishable and a reason is given", () => {
    expect(publishProblems(proposal(), {}, reasons)).toEqual([]);
  });

  it("carries the server's blockers", () => {
    const blocked = proposal({blockers: ["Tier 1 is above the market ceiling"]});
    expect(publishProblems(blocked, {}, reasons)).toContain("Tier 1 is above the market ceiling");
  });

  it("asks for each reason only when the proposal needs it", () => {
    const needsBoth = proposal({phase_in_reason_required: true, below_cost_reason_required: true});
    const problems = publishProblems(needsBoth, {}, {change: "", phaseIn: "", belowCost: ""});
    expect(problems).toHaveLength(3);
    expect(publishProblems(needsBoth, {}, {change: "Term", phaseIn: "Gradual", belowCost: "Growth"})).toEqual([]);
  });

  it("refuses unfinished overrides and prices already in force", () => {
    expect(publishProblems(proposal(), {t1: {price: "30000", reason: ""}}, reasons)).toContain("Finish or clear the tier overrides.");
    expect(publishProblems(proposal({changes_prices: false}), {}, reasons)).toContain("These prices are already in force.");
  });
});

describe("publishInput", () => {
  it("pins the previewed versions and drops reasons the proposal doesn't need", () => {
    const input = publishInput(
      proposal({phase_in_reason_required: true}),
      {t1: {price: "30000", reason: "Scholarship"}},
      {change: " New term ", phaseIn: " Gradual ", belowCost: "not needed"},
    );
    expect(input).toEqual({
      overrides: [{tier_id: "t1", price: "30000", reason: "Scholarship"}],
      expected_template_version: 3,
      expected_parameter_version: 2,
      expected_tier_revision: 5,
      expected_active_publication: 1,
      change_reason: "New term",
      phase_in_reason: "Gradual",
      below_cost_reason: null,
    });
  });
});
