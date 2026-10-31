import {fractionToPct, pctToFraction, shiftDecimal} from "./pricingForm";
import type {
  ApiProgramVersion,
  DirectCostCategory,
  Edition,
  ProgramType,
  TemplateInput,
} from "../services/templates.service";

/** The three live-teaching formats a student can pick, in the order they're shown. */
export const EDITIONS: readonly Edition[] = ["self_paced", "group", "one_to_one"];

/** Students taught together in a live group session. One-to-one is always 1. */
export const GROUP_SEATS = 5;

export const EDITION_LABELS: Record<Edition, string> = {
  self_paced: "Self-paced",
  group: "Live group (1 teacher : 5 students)",
  one_to_one: "Live 1-to-1",
};

/** Accepts the old names too, for links and bookmarks from before the formats existed. */
export const asEdition = (value: string): Edition | null => {
  if (value === "standard") return "group";
  if (value === "premium") return "one_to_one";
  return (EDITIONS as readonly string[]).includes(value) ? (value as Edition) : null;
};

export interface DirectCostForm {
  key: string;
  category: DirectCostCategory | "";
  label: string;
  amount: string;
  currency: "NGN" | "USD";
  vatable: boolean;
}

export interface TemplateForm {
  liveSessions: string;
  hoursPerSession: string;
  /** Weeks the program runs, shown to learners and parents beside the live sessions. */
  durationWeeks: string;
  hourlyRate: string;
  directCosts: DirectCostForm[];
  developmentCost: string;
  periods: string;
  enrolmentsPerPeriod: string;
  /** The highest viable price for each format, VAT included. Blank = none set. */
  ceilings: Record<Edition, string>;
  aiMonths: string;
  overrideOn: boolean;
  overridePct: string;
  overrideReason: string;
}

export const DIRECT_COST_CATEGORIES: {value: DirectCostCategory; label: string}[] = [
  {value: "ai", label: "AI usage"},
  {value: "messaging", label: "Messaging"},
  {value: "hosting", label: "Hosting & video delivery"},
  {value: "acquisition", label: "Ads per enrolment"},
  {value: "marking", label: "Mock exam marking"},
  {value: "materials", label: "Materials"},
  {value: "other", label: "Other"},
];

let counter = 0;
const line = (category: DirectCostCategory | "" = "", label = ""): DirectCostForm => ({
  key: `dc-${Date.now()}-${counter++}`,
  category,
  label,
  amount: "",
  currency: "NGN",
  vatable: false,
});
export const newDirectCost = () => line();

/**
 * A new template lists the usual per-enrolment costs with blank amounts, so
 * the admin is prompted for each without any made-up figure being saved. An
 * exam program is amortised over a single exam cycle by default (D10).
 */
export const emptyTemplateForm = (programType: ProgramType): TemplateForm => ({
  liveSessions: "",
  hoursPerSession: "1",
  durationWeeks: "",
  hourlyRate: "",
  directCosts: [
    line("ai", "AI usage (Brainy)"),
    line("messaging", "WhatsApp and SMS"),
    line("hosting", "Hosting and video delivery"),
    line("acquisition", "Ads per enrolment"),
    ...(programType === "exam" ? [line("marking", "Mock exam marking")] : []),
  ],
  developmentCost: "",
  periods: programType === "exam" ? "1" : "",
  enrolmentsPerPeriod: "",
  ceilings: {self_paced: "", group: "", one_to_one: ""},
  aiMonths: programType === "exam" ? "6" : "12",
  overrideOn: false,
  overridePct: "",
  overrideReason: "",
});

const plain = (v: string | number) => shiftDecimal(String(v), 0);

export const templateFormFromVersion = (v: ApiProgramVersion): TemplateForm => ({
  liveSessions: String(v.live_sessions),
  hoursPerSession: plain(v.hours_per_session),
  durationWeeks: v.duration_weeks == null ? "" : String(v.duration_weeks),
  hourlyRate: plain(v.teacher_hourly_rate),
  directCosts: v.direct_costs.map((d) => ({
    key: d.line_id, category: d.category, label: d.label, amount: plain(d.amount), currency: d.currency, vatable: d.vatable,
  })),
  developmentCost: plain(v.development_cost),
  periods: plain(v.amortisation_periods),
  enrolmentsPerPeriod: String(v.enrolments_per_period),
  ceilings: Object.fromEntries(
    EDITIONS.map((e) => [e, v.market_ceilings[e] != null ? plain(v.market_ceilings[e] as string) : ""]),
  ) as Record<Edition, string>,
  aiMonths: String(v.ai_allowance_months ?? 12),
  overrideOn: v.margin_override !== null,
  overridePct: v.margin_override !== null ? fractionToPct(v.margin_override) : "",
  overrideReason: v.margin_override_reason ?? "",
});

const clean = (s: string) => s.replace(/,/g, "").trim();
const DECIMAL = /^\d+(\.\d+)?$/;
const WHOLE = /^\d+$/;

export type TemplateErrors = Partial<Record<keyof TemplateForm | `cost-${string}` | `ceiling-${Edition}`, string>>;

export const validateTemplate = (form: TemplateForm): TemplateErrors => {
  const e: TemplateErrors = {};
  const sessions = clean(form.liveSessions);
  if (!WHOLE.test(sessions)) e.liveSessions = "Enter a whole number (0 for none)";
  const hasSessions = WHOLE.test(sessions) && Number(sessions) > 0;

  const weeks = clean(form.durationWeeks);
  if (!WHOLE.test(weeks) || Number(weeks) < 1 || Number(weeks) > 260) e.durationWeeks = "Enter the number of weeks, 1 to 260";

  if (hasSessions) {
    if (!DECIMAL.test(clean(form.hoursPerSession)) || Number(clean(form.hoursPerSession)) <= 0) e.hoursPerSession = "Enter the length in hours";
    if (!DECIMAL.test(clean(form.hourlyRate)) || Number(clean(form.hourlyRate)) <= 0) e.hourlyRate = "Enter the teacher's hourly rate";
  }

  form.directCosts.forEach((d) => {
    if (!d.category) e[`cost-${d.key}`] = "Choose a category";
    else if (!d.label.trim()) e[`cost-${d.key}`] = "Describe this cost";
    else if (!DECIMAL.test(clean(d.amount))) e[`cost-${d.key}`] = "Enter the amount per enrolment (0 if none)";
  });

  if (!DECIMAL.test(clean(form.developmentCost))) e.developmentCost = "Enter the development cost (0 if none)";
  if (!DECIMAL.test(clean(form.periods)) || Number(clean(form.periods)) <= 0) e.periods = "Enter a number above 0";
  if (!WHOLE.test(clean(form.enrolmentsPerPeriod)) || Number(clean(form.enrolmentsPerPeriod)) <= 0) e.enrolmentsPerPeriod = "Enter a whole number above 0";

  const aiMonths = clean(form.aiMonths);
  if (!WHOLE.test(aiMonths) || Number(aiMonths) < 1 || Number(aiMonths) > 60) e.aiMonths = "Enter 1 to 60 months";

  EDITIONS.forEach((ed) => {
    const ceiling = clean(form.ceilings[ed]);
    if (ceiling && (!DECIMAL.test(ceiling) || Number(ceiling) <= 0)) e[`ceiling-${ed}`] = "Enter a price above 0, or leave blank";
  });

  if (form.overrideOn) {
    if (!DECIMAL.test(clean(form.overridePct)) || Number(clean(form.overridePct)) >= 100) e.overridePct = "Enter a margin below 100%";
    if (form.overrideReason.trim().length < 3) e.overrideReason = "Record why this program has its own margin";
  }
  return e;
};

/**
 * What the server prices. A format that can't apply (live teaching with no live sessions) keeps no ceiling,
 * so a stale figure typed before the sessions were zeroed isn't saved.
 */
export const templateInput = (form: TemplateForm): TemplateInput => {
  const sessions = Number(clean(form.liveSessions));
  const ceilings: Partial<Record<Edition, string | null>> = {};
  EDITIONS.forEach((ed) => {
    const live = ed !== "self_paced";
    ceilings[ed] = live && sessions === 0 ? null : clean(form.ceilings[ed]) || null;
  });
  return {
    live_sessions: sessions,
    // A purely self-paced program has no live sessions, so their length and
    // rate are irrelevant -- send neutral values rather than blanks.
    hours_per_session: sessions > 0 ? clean(form.hoursPerSession) : "0",
    duration_weeks: Number(clean(form.durationWeeks)),
    teacher_hourly_rate: sessions > 0 ? clean(form.hourlyRate) : "0",
    direct_costs: form.directCosts.map((d) => ({
      category: d.category as DirectCostCategory,
      label: d.label.trim(),
      amount: clean(d.amount),
      currency: d.currency,
      vatable: d.vatable,
    })),
    development_cost: clean(form.developmentCost),
    amortisation_periods: clean(form.periods),
    enrolments_per_period: Number(clean(form.enrolmentsPerPeriod)),
    market_ceilings: ceilings,
    ai_allowance_months: Number(clean(form.aiMonths)),
    margin_override: form.overrideOn ? pctToFraction(form.overridePct) : null,
    margin_override_reason: form.overrideOn ? form.overrideReason.trim() : null,
  };
};

/**
 * The teaching cost one student carries in a live format: the whole session for one-to-one, a fifth of it
 * in a group. Mirrors the server's formula, shown to the admin as plain arithmetic, not used for pricing.
 */
export const teachingCostPerStudent = (form: TemplateForm, edition: Edition): number | null => {
  if (edition === "self_paced") return 0;
  const sessions = Number(clean(form.liveSessions));
  const hours = Number(clean(form.hoursPerSession));
  const rate = Number(clean(form.hourlyRate));
  if (![sessions, hours, rate].every(Number.isFinite) || sessions <= 0) return null;
  return (sessions * hours * rate) / (edition === "group" ? GROUP_SEATS : 1);
};
