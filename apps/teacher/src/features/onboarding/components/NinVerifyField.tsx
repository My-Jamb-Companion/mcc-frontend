"use client";

import { useState } from "react";
import { Icon } from "@mcc/ui";
import { FormInputs, useFormContext, useWatch } from "@mcc/features";
import { NinVerifyField as NinVerifyFieldType } from "../types/formTypes";
import { verifyNin } from "../services/onboarding.service";

const NIN_PATTERN = /^\d{11}$/;

// One button touches three RHF fields at once (nin, dob, status), so this
// reads/writes them directly via setValue/watch rather than a single-field
// Controller -- same direct-setValue pattern already used for the learner
// onboarding wizard's "Other" free-text toggle
// (apps/learner/.../TileRenderer.tsx), applied here for the first time in
// the teacher app.
export function NinVerifyField({ field }: { field: NinVerifyFieldType }) {
  const { control, setValue, trigger } = useFormContext();
  const [nin, dob, status] = useWatch({
    control,
    name: [field.id, field.dobFieldId, field.statusFieldId],
  });
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const ninValid = NIN_PATTERN.test(nin ?? "");
  const canVerify = ninValid && !!dob && !verifying;

  function markUnverified() {
    if (status) setValue(field.statusFieldId, "", { shouldValidate: true });
    setResult(null);
  }

  async function handleVerify() {
    if (!canVerify) return;
    setVerifying(true);
    setResult(null);
    try {
      const outcome = await verifyNin(nin, dob);
      if (outcome.status === "verified" || outcome.status === "unavailable") {
        setValue(field.statusFieldId, outcome.status, { shouldValidate: true });
        setResult({ ok: true, message: outcome.detail });
      } else {
        setValue(field.statusFieldId, "", { shouldValidate: true });
        setResult({ ok: false, message: outcome.detail });
      }
    } catch {
      setResult({
        ok: false,
        message: "Couldn't reach the verification service. Please try again.",
      });
    } finally {
      setVerifying(false);
      trigger([field.id, field.dobFieldId, field.statusFieldId]);
    }
  }

  const verified = status === "verified";
  const unavailable = status === "unavailable";

  return (
    <div className="flex flex-col gap-3 w-full">
      <FormInputs
        label={field.question}
        type="tel"
        placeholder="11-digit NIN"
        value={nin ?? ""}
        onChange={(v) => {
          setValue(field.id, v.replace(/\D/g, "").slice(0, 11));
          markUnverified();
        }}
        inputClassName="text-black! dark:text-white!"
      />

      <FormInputs
        label="Date of birth"
        type="date"
        value={dob ?? ""}
        onChange={(v) => {
          setValue(field.dobFieldId, v);
          markUnverified();
        }}
      />

      <button
        type="button"
        onClick={handleVerify}
        disabled={!canVerify}
        className={`flex items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium transition-colors ${
          verified
            ? "border-success/40 bg-success/10 text-success"
            : canVerify
              ? "border-btn-primary text-btn-primary hover:bg-btn-primary/10 cursor-pointer"
              : "border-muted/20 text-muted cursor-not-allowed"
        }`}
      >
        {verifying ? (
          <>
            <Icon icon="mdi:loading" size={16} className="animate-spin" />
            Verifying...
          </>
        ) : verified ? (
          <>
            <Icon icon="mdi:check-circle" size={16} />
            Verified -- click to re-verify
          </>
        ) : (
          "Verify"
        )}
      </button>

      {result && (
        <p
          className={`text-start text-xs ${
            result.ok ? (unavailable ? "text-amber-500" : "text-success") : "text-danger"
          }`}
        >
          {result.message}
        </p>
      )}

      {field.helpText && !result && <p className="text-xs text-muted">{field.helpText}</p>}
    </div>
  );
}
