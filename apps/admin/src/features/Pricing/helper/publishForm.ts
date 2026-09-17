import type {ApiProposal, PublishInput, TierOverride} from "../services/publications.service";

/** An admin's price for one tier, as typed. Blank price means "use the proposed price". */
export interface OverrideDraft {
  price: string;
  reason: string;
}

export type OverrideDrafts = Record<string, OverrideDraft>;

const clean = (s: string) => s.replace(/,/g, "").trim();
const MONEY = /^\d+(\.\d{1,2})?$/;

/** Why a tier's override can't be sent yet, or undefined when it's fine or unused. */
export const overrideError = (draft: OverrideDraft | undefined): string | undefined => {
  if (!draft || !clean(draft.price)) return undefined;
  const price = clean(draft.price);
  if (!MONEY.test(price) || Number(price) <= 0) return "Enter a price above 0";
  if (draft.reason.trim().length < 3) return "Record why this tier gets its own price";
  return undefined;
};

/** Overrides ready to send: a valid price and a reason. Half-typed ones are left out of the preview. */
export const completeOverrides = (drafts: OverrideDrafts): TierOverride[] =>
  Object.entries(drafts)
    .filter(([, d]) => clean(d.price) && !overrideError(d))
    .map(([tier_id, d]) => ({tier_id, price: clean(d.price), reason: d.reason.trim()}));

export interface PublishReasons {
  change: string;
  phaseIn: string;
  belowCost: string;
}

/**
 * What still stops the admin publishing, checked before sending. The server
 * checks all of it again; this only saves a round trip and says it plainly.
 */
export const publishProblems = (
  proposal: ApiProposal | undefined,
  drafts: OverrideDrafts,
  reasons: PublishReasons,
): string[] => {
  if (!proposal) return ["Prices are still being worked out."];
  const problems = [...proposal.blockers];
  if (Object.values(drafts).some((d) => overrideError(d))) problems.push("Finish or clear the tier overrides.");
  if (proposal.blockers.length === 0 && !proposal.changes_prices) problems.push("These prices are already in force.");
  if (proposal.phase_in_reason_required && reasons.phaseIn.trim().length < 3)
    problems.push("Record why prices are phasing in below the formula.");
  if (proposal.below_cost_reason_required && reasons.belowCost.trim().length < 3)
    problems.push("Record why unfunded tier discounts are deliberate.");
  if (reasons.change.trim().length < 3) problems.push("Say briefly why prices are being published.");
  return problems;
};

/** The publish request for exactly the previewed proposal. */
export const publishInput = (proposal: ApiProposal, drafts: OverrideDrafts, reasons: PublishReasons): PublishInput => ({
  overrides: completeOverrides(drafts),
  expected_template_version: proposal.template_version,
  expected_parameter_version: proposal.parameter_version,
  expected_tier_revision: proposal.tier_revision,
  expected_active_publication: proposal.active_publication,
  change_reason: reasons.change.trim(),
  phase_in_reason: proposal.phase_in_reason_required ? reasons.phaseIn.trim() : null,
  below_cost_reason: proposal.below_cost_reason_required ? reasons.belowCost.trim() : null,
});
