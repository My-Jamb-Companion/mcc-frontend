import type {
  ApiPricingParameters,
  CompanyTaxStatus,
  OverheadCategory,
  OverheadCurrency,
  PricingParametersInput,
  VatTreatment,
} from "../services/pricing.service";

/**
 * Form state for the pricing parameters screen.
 *
 * Everything is held as the string the admin typed, and rates in percent
 * (7.5), because that is how people think about them. The API wants fractions
 * (0.075); entering 7.5 where 0.075 was meant is the single likeliest mistake
 * on this screen, so the conversion lives here, once, rather than in each input.
 */

export interface OverheadLineForm {
  key: string;
  category: OverheadCategory | "";
  label: string;
  amount: string;
  currency: OverheadCurrency;
  vatable: boolean;
}

export interface PricingForm {
  enrolments: string;
  lines: OverheadLineForm[];
  vatTreatment: VatTreatment | "";
  vatPct: string;
  gatewayPct: string;
  referralSharePct: string;
  referralPayoutPct: string;
  refundPct: string;
  marginPct: string;
  taxStatus: CompanyTaxStatus | "";
  incomeTaxPct: string;
  levyPct: string;
  usdRate: string;
  fxBufferPct: string;
  fxThresholdPct: string;
  roundingStep: string;
  maxIncreasePct: string;
  aiUsdPerMillion: string;
  freeDailyTokens: string;
  tokensPerGem: string;
  flatMonthlyTokens: string;
}

export const OVERHEAD_CATEGORIES: {value: OverheadCategory; label: string}[] = [
  {value: "legal", label: "Legal"},
  {value: "accounting", label: "Accounting"},
  {value: "statutory", label: "CAC & statutory filings"},
  {value: "payroll", label: "Staff payroll (non-course)"},
  {value: "equipment", label: "Equipment"},
  {value: "hosting", label: "Cloud hosting"},
  {value: "software", label: "Software & integrations"},
  {value: "advertising", label: "Traditional advertising"},
  {value: "other", label: "Other"},
];

let lineCounter = 0;
export const newLine = (): OverheadLineForm => ({
  key: `line-${Date.now()}-${lineCounter++}`,
  category: "",
  label: "",
  amount: "",
  currency: "NGN",
  vatable: false,
});

/**
 * A first version starts with only the statutory figures from the approved
 * spec filled in. Business figures -- overheads, enrolments, margin, fees --
 * are left blank on purpose: the spec's worked example is illustrative, and
 * prefilling it would make it far too easy to save made-up numbers as MCC's.
 * VAT treatment and tax status are also left for an explicit choice, since
 * both are pending the accountant's confirmation (D4, D5).
 */
export const emptyForm = (): PricingForm => ({
  enrolments: "",
  lines: [newLine()],
  vatTreatment: "",
  vatPct: "7.5",
  gatewayPct: "",
  referralSharePct: "",
  referralPayoutPct: "",
  refundPct: "",
  marginPct: "",
  taxStatus: "",
  incomeTaxPct: "30",
  levyPct: "4",
  usdRate: "",
  fxBufferPct: "",
  fxThresholdPct: "",
  roundingStep: "500",
  maxIncreasePct: "15",
  aiUsdPerMillion: "0.40",
  freeDailyTokens: "5000",
  tokensPerGem: "2000",
  flatMonthlyTokens: "100000",
});

const DECIMAL = /^\d+(\.\d+)?$/;
const clean = (s: string) => s.replace(/,/g, "").trim();

/** Move the decimal point `places` to the right (negative: left), exactly, on the string. */
export const shiftDecimal = (value: string, places: number): string => {
  const [intPart, fracPart = ""] = clean(value).split(".");
  const digits = intPart + fracPart;
  let point = intPart.length + places;
  let padded = digits;
  if (point <= 0) {
    padded = "0".repeat(1 - point) + digits;
    point = 1;
  } else if (point > digits.length) {
    padded = digits + "0".repeat(point - digits.length);
  }
  const whole = padded.slice(0, point).replace(/^0+(?=\d)/, "");
  const fraction = padded.slice(point).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
};

export const pctToFraction = (pct: string) => shiftDecimal(pct, -2);
export const fractionToPct = (fraction: string) => shiftDecimal(String(fraction), 2);

const trimAmount = (value: string) => shiftDecimal(String(value), 0);

export const fromApi = (p: ApiPricingParameters): PricingForm => ({
  enrolments: String(p.expected_catalogue_enrolments),
  lines: p.overhead_lines.map((line) => ({
    key: line.line_id,
    category: line.category,
    label: line.label,
    amount: trimAmount(line.annual_amount),
    currency: line.currency,
    vatable: line.vatable,
  })),
  vatTreatment: p.vat_treatment,
  vatPct: fractionToPct(p.vat_rate),
  gatewayPct: fractionToPct(p.gateway_rate),
  referralSharePct: fractionToPct(p.referral_share),
  referralPayoutPct: fractionToPct(p.referral_payout_rate),
  refundPct: fractionToPct(p.refund_reserve_rate),
  marginPct: fractionToPct(p.target_after_tax_margin),
  taxStatus: p.company_tax_status,
  incomeTaxPct: fractionToPct(p.income_tax_rate),
  levyPct: fractionToPct(p.development_levy_rate),
  usdRate: trimAmount(p.usd_ngn_rate),
  fxBufferPct: fractionToPct(p.fx_buffer_rate),
  fxThresholdPct: fractionToPct(p.fx_reprice_threshold),
  roundingStep: String(p.price_rounding_step),
  maxIncreasePct: fractionToPct(p.max_price_increase_rate),
  aiUsdPerMillion: trimAmount(p.ai_usd_per_million_tokens),
  freeDailyTokens: String(p.free_daily_tokens),
  tokensPerGem: String(p.tokens_per_gem),
  flatMonthlyTokens: String(p.flat_price_monthly_tokens),
});

export type FormErrors = Partial<Record<keyof PricingForm | `line-${string}`, string>>;

const pct = (value: string, {max = 100, allowMax = false, positive = false} = {}) => {
  const v = clean(value);
  if (!v) return "Required";
  if (!DECIMAL.test(v)) return "Enter a number, e.g. 7.5";
  const n = Number(v);
  if (positive && n <= 0) return "Must be above 0%";
  if (allowMax ? n > max : n >= max) return `Must be ${allowMax ? "at most" : "below"} ${max}%`;
  return undefined;
};

export const validate = (form: PricingForm): FormErrors => {
  const errors: FormErrors = {};

  const enrol = clean(form.enrolments);
  if (!/^\d+$/.test(enrol) || Number(enrol) <= 0) errors.enrolments = "Enter a whole number above 0";

  form.lines.forEach((line) => {
    const amount = clean(line.amount);
    if (!line.category) errors[`line-${line.key}`] = "Choose a category";
    else if (!line.label.trim()) errors[`line-${line.key}`] = "Describe this cost";
    else if (!DECIMAL.test(amount)) errors[`line-${line.key}`] = "Enter the annual amount";
  });

  if (!form.vatTreatment) errors.vatTreatment = "Choose how courses are treated for VAT";
  if (!form.taxStatus) errors.taxStatus = "Choose the company's tax status";

  const rateChecks: [keyof PricingForm, string | undefined][] = [
    ["vatPct", pct(form.vatPct)],
    ["gatewayPct", pct(form.gatewayPct)],
    ["referralSharePct", pct(form.referralSharePct, {allowMax: true})],
    ["referralPayoutPct", pct(form.referralPayoutPct)],
    ["refundPct", pct(form.refundPct)],
    ["marginPct", pct(form.marginPct)],
    ["incomeTaxPct", pct(form.incomeTaxPct)],
    ["levyPct", pct(form.levyPct)],
    ["fxBufferPct", pct(form.fxBufferPct)],
    ["fxThresholdPct", pct(form.fxThresholdPct, {positive: true})],
    ["maxIncreasePct", pct(form.maxIncreasePct, {positive: true, allowMax: true})],
  ];
  rateChecks.forEach(([field, error]) => {
    if (error) errors[field] = error;
  });

  if (!errors.incomeTaxPct && !errors.levyPct && Number(clean(form.incomeTaxPct)) + Number(clean(form.levyPct)) >= 100) {
    errors.levyPct = "Income tax plus levy must be below 100%";
  }

  const usd = clean(form.usdRate);
  if (!DECIMAL.test(usd) || Number(usd) <= 0) errors.usdRate = "Enter naira per US dollar";

  const aiPrice = clean(form.aiUsdPerMillion);
  if (!DECIMAL.test(aiPrice) || Number(aiPrice) <= 0) errors.aiUsdPerMillion = "Enter the price in dollars, above 0";
  const whole = (value: string, positive = false) => {
    const v = clean(value);
    return /^\d+$/.test(v) && (!positive || Number(v) > 0);
  };
  if (!whole(form.freeDailyTokens)) errors.freeDailyTokens = "Enter a whole number of tokens (0 for none)";
  if (!whole(form.tokensPerGem, true)) errors.tokensPerGem = "Enter a whole number of tokens above 0";
  if (!whole(form.flatMonthlyTokens)) errors.flatMonthlyTokens = "Enter a whole number of tokens (0 for none)";

  const step = clean(form.roundingStep);
  if (!/^\d+$/.test(step) || Number(step) <= 0) errors.roundingStep = "Enter a whole naira amount above 0";

  return errors;
};

export const toInput = (
  form: PricingForm,
  basedOn: number | null,
  changeReason: string,
): PricingParametersInput => ({
  based_on_version: basedOn,
  change_reason: changeReason.trim(),
  expected_catalogue_enrolments: Number(clean(form.enrolments)),
  overhead_lines: form.lines.map((line) => ({
    category: line.category as OverheadCategory,
    label: line.label.trim(),
    annual_amount: clean(line.amount),
    currency: line.currency,
    vatable: line.vatable,
  })),
  vat_treatment: form.vatTreatment as VatTreatment,
  vat_rate: pctToFraction(form.vatPct),
  gateway_rate: pctToFraction(form.gatewayPct),
  referral_share: pctToFraction(form.referralSharePct),
  referral_payout_rate: pctToFraction(form.referralPayoutPct),
  refund_reserve_rate: pctToFraction(form.refundPct),
  target_after_tax_margin: pctToFraction(form.marginPct),
  company_tax_status: form.taxStatus as CompanyTaxStatus,
  income_tax_rate: pctToFraction(form.incomeTaxPct),
  development_levy_rate: pctToFraction(form.levyPct),
  usd_ngn_rate: clean(form.usdRate),
  fx_buffer_rate: pctToFraction(form.fxBufferPct),
  fx_reprice_threshold: pctToFraction(form.fxThresholdPct),
  price_rounding_step: Number(clean(form.roundingStep)),
  max_price_increase_rate: pctToFraction(form.maxIncreasePct),
  ai_usd_per_million_tokens: clean(form.aiUsdPerMillion),
  free_daily_tokens: Number(clean(form.freeDailyTokens)),
  tokens_per_gem: Number(clean(form.tokensPerGem)),
  flat_price_monthly_tokens: Number(clean(form.flatMonthlyTokens)),
});

/** Comparable form of a version's inputs, ignoring the reason and base version. */
export const fingerprint = (form: PricingForm) => JSON.stringify(toInput(form, null, ""));

export interface Preview {
  vat: number;
  tax: number;
  preTaxMargin: number;
  referral: number;
  deductions: number;
  headroom: number;
  usdEffective: number;
  annualOverhead: number;
  overheadPerEnrolment: number | null;
  lineNgn: Record<string, number>;
}

const num = (s: string) => {
  const v = clean(s);
  return DECIMAL.test(v) ? Number(v) : NaN;
};

/**
 * A live, display-only preview mirroring app/features/pricing/formula.py so
 * the admin sees the effect of a change before saving. Floats are fine here:
 * nothing is stored from it -- the server recomputes every figure in Decimal
 * on save, and those are what later pricing uses.
 */
export const preview = (form: PricingForm): Preview => {
  const vatRate = num(form.vatPct) / 100;
  const vat = form.vatTreatment === "standard" ? vatRate : 0;
  const tax = form.taxStatus === "standard" ? (num(form.incomeTaxPct) + num(form.levyPct)) / 100 : 0;
  const preTaxMargin = num(form.marginPct) / 100 / (1 - tax);
  const referral = (num(form.referralSharePct) / 100) * (num(form.referralPayoutPct) / 100);
  const deductions = (num(form.gatewayPct) / 100) * (1 + vat) + referral + num(form.refundPct) / 100;
  const usdEffective = num(form.usdRate) * (1 + num(form.fxBufferPct) / 100);

  const lineNgn: Record<string, number> = {};
  let annualOverhead = 0;
  form.lines.forEach((line) => {
    let amount = num(line.amount);
    if (Number.isNaN(amount)) amount = 0;
    if (line.currency === "USD") amount *= usdEffective;
    if (line.vatable && form.vatTreatment === "exempt") amount *= 1 + vatRate;
    lineNgn[line.key] = amount;
    annualOverhead += amount;
  });

  const enrolments = num(form.enrolments);
  return {
    vat,
    tax,
    preTaxMargin,
    referral,
    deductions,
    headroom: 1 - deductions - preTaxMargin,
    usdEffective,
    annualOverhead,
    overheadPerEnrolment: enrolments > 0 ? annualOverhead / enrolments : null,
    lineNgn,
  };
};
