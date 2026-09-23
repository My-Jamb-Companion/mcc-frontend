import {describe, expect, it} from "vitest";
import {emptyForm, toInput, validate} from "./pricingForm";
import {emptyTemplateForm, templateInput, validateTemplate} from "./templateForm";

describe("Brainy settings on company parameters", () => {
  it("starts from the defaults and sends them as numbers", () => {
    const input = toInput(emptyForm(), null, "reason");
    expect(input).toMatchObject({
      ai_usd_per_million_tokens: "0.40",
      free_daily_tokens: 5000,
      tokens_per_gem: 2000,
      flat_price_monthly_tokens: 100000,
    });
  });

  it("rejects a zero AI price or tokens per gem, but allows no free tokens", () => {
    const errors = validate({...emptyForm(), aiUsdPerMillion: "0", tokensPerGem: "0", freeDailyTokens: "0", flatMonthlyTokens: "1.5"});
    expect(errors.aiUsdPerMillion).toBeDefined();
    expect(errors.tokensPerGem).toBeDefined();
    expect(errors.freeDailyTokens).toBeUndefined();
    expect(errors.flatMonthlyTokens).toBeDefined();
  });
});

describe("AI allowance months on a cost template", () => {
  it("defaults to a year for courses and six months for exam programs", () => {
    expect(emptyTemplateForm("course", "standard").aiMonths).toBe("12");
    expect(emptyTemplateForm("exam", "standard").aiMonths).toBe("6");
  });

  it("must be 1 to 60 whole months, and is sent as a number", () => {
    const form = {...emptyTemplateForm("course", "standard"), aiMonths: "0"};
    expect(validateTemplate(form, "standard").aiMonths).toBeDefined();
    expect(validateTemplate({...form, aiMonths: "61"}, "standard").aiMonths).toBeDefined();
    expect(validateTemplate({...form, aiMonths: "4"}, "standard").aiMonths).toBeUndefined();
    expect(templateInput({...form, aiMonths: "4"}, "standard").ai_allowance_months).toBe(4);
  });
});
