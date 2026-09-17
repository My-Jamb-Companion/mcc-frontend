import {fractionToPct, pctToFraction, shiftDecimal} from "./pricingForm";
import type {
  ApiTemplateVersion,
  DirectCostCategory,
  Edition,
  ProgramType,
  TemplateInput,
} from "../services/templates.service";

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
  hourlyRate: string;
  seats: string;
  directCosts: DirectCostForm[];
  developmentCost: string;
  periods: string;
  enrolmentsPerPeriod: string;
  marketCeiling: string;
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
 * the admin is prompted for each without any made-up figure being saved. The
 * premium edition is one-on-one, so its seat count is fixed at 1; an exam
 * program is amortised over a single exam cycle by default (D10).
 */
export const emptyTemplateForm = (programType: ProgramType, edition: Edition): TemplateForm => ({
  liveSessions: "",
  hoursPerSession: "1",
  hourlyRate: "",
  seats: edition === "premium" ? "1" : "",
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
  marketCeiling: "",
  overrideOn: false,
  overridePct: "",
  overrideReason: "",
});

const plain = (v: string | number) => shiftDecimal(String(v), 0);

export const templateFormFromVersion = (v: ApiTemplateVersion): TemplateForm => ({
  liveSessions: String(v.live_sessions),
  hoursPerSession: plain(v.hours_per_session),
  hourlyRate: plain(v.teacher_hourly_rate),
  seats: String(v.seats_per_session),
  directCosts: v.direct_costs.map((d) => ({
    key: d.line_id, category: d.category, label: d.label, amount: plain(d.amount), currency: d.currency, vatable: d.vatable,
  })),
  developmentCost: plain(v.development_cost),
  periods: plain(v.amortisation_periods),
  enrolmentsPerPeriod: String(v.enrolments_per_period),
  marketCeiling: v.market_ceiling !== null ? plain(v.market_ceiling) : "",
  overrideOn: v.margin_override !== null,
  overridePct: v.margin_override !== null ? fractionToPct(v.margin_override) : "",
  overrideReason: v.margin_override_reason ?? "",
});

const clean = (s: string) => s.replace(/,/g, "").trim();
const DECIMAL = /^\d+(\.\d+)?$/;
const WHOLE = /^\d+$/;

export type TemplateErrors = Partial<Record<keyof TemplateForm | `cost-${string}`, string>>;

export const validateTemplate = (form: TemplateForm, edition: Edition): TemplateErrors => {
  const e: TemplateErrors = {};
  const sessions = clean(form.liveSessions);
  if (!WHOLE.test(sessions)) e.liveSessions = "Enter a whole number (0 for none)";
  const hasSessions = WHOLE.test(sessions) && Number(sessions) > 0;

  if (edition === "premium" && WHOLE.test(sessions) && Number(sessions) < 1) {
    e.liveSessions = "Premium includes at least one one-on-one session";
  }
  if (hasSessions) {
    if (!DECIMAL.test(clean(form.hoursPerSession)) || Number(clean(form.hoursPerSession)) <= 0) e.hoursPerSession = "Enter the length in hours";
    if (!DECIMAL.test(clean(form.hourlyRate)) || Number(clean(form.hourlyRate)) <= 0) e.hourlyRate = "Enter the teacher's hourly rate";
    const seats = clean(form.seats);
    if (!WHOLE.test(seats) || Number(seats) < 1) e.seats = "Enter the number of students per session";
    else if (edition === "standard" && Number(seats) < 2) e.seats = "Group classes have at least 2 students; one-on-one is the premium edition";
  }

  form.directCosts.forEach((d) => {
    if (!d.category) e[`cost-${d.key}`] = "Choose a category";
    else if (!d.label.trim()) e[`cost-${d.key}`] = "Describe this cost";
    else if (!DECIMAL.test(clean(d.amount))) e[`cost-${d.key}`] = "Enter the amount per enrolment (0 if none)";
  });

  if (!DECIMAL.test(clean(form.developmentCost))) e.developmentCost = "Enter the development cost (0 if none)";
  if (!DECIMAL.test(clean(form.periods)) || Number(clean(form.periods)) <= 0) e.periods = "Enter a number above 0";
  if (!WHOLE.test(clean(form.enrolmentsPerPeriod)) || Number(clean(form.enrolmentsPerPeriod)) <= 0) e.enrolmentsPerPeriod = "Enter a whole number above 0";

  const ceiling = clean(form.marketCeiling);
  if (ceiling && (!DECIMAL.test(ceiling) || Number(ceiling) <= 0)) e.marketCeiling = "Enter a price above 0, or leave blank";

  if (form.overrideOn) {
    if (!DECIMAL.test(clean(form.overridePct)) || Number(clean(form.overridePct)) >= 100) e.overridePct = "Enter a margin below 100%";
    if (form.overrideReason.trim().length < 3) e.overrideReason = "Record why this program has its own margin";
  }
  return e;
};

export const templateInput = (form: TemplateForm, edition: Edition): TemplateInput => {
  const sessions = Number(clean(form.liveSessions));
  return {
    live_sessions: sessions,
    // A purely self-paced program has no live sessions, so their length, rate
    // and class size are irrelevant -- send neutral values rather than blanks.
    hours_per_session: sessions > 0 ? clean(form.hoursPerSession) : "0",
    teacher_hourly_rate: sessions > 0 ? clean(form.hourlyRate) : "0",
    seats_per_session: edition === "premium" ? 1 : sessions > 0 ? Number(clean(form.seats)) : 1,
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
    market_ceiling: clean(form.marketCeiling) || null,
    margin_override: form.overrideOn ? pctToFraction(form.overridePct) : null,
    margin_override_reason: form.overrideOn ? form.overrideReason.trim() : null,
  };
};
