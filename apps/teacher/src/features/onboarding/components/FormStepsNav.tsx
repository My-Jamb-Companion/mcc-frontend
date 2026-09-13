import { useMemo } from "react";
import { useFormContext, useWatch } from "@mcc/features";
import { FormStep } from "../types/formTypes";

export function StepNavigation({
  step,
  totalSteps,
  currentStep,
  next,
  back,
  onSubmit,
}: {
  step: number;
  totalSteps: number;
  currentStep: FormStep;
  next: () => void;
  back: () => void;
  onSubmit: () => void;
}) {
  const { trigger, control } = useFormContext();

  const fieldNames = useMemo(() => {
    if (currentStep.inputType === "mixed") return currentStep.fields.map((f) => f.id);
    if (currentStep.inputType === "tile-multi") return [currentStep.fieldId];
    return [];
  }, [currentStep]);

  // Reactive subscription (not an imperative getValues() snapshot): without
  // this, isStepValid can go stale after a Controller-driven field (file
  // upload, checkbox-group, photo-upload) updates, until some *other*
  // incidental re-render happens to pick up the fresh value -- e.g. a real
  // teacher who picks a file in the OS dialog then immediately clicks
  // "Continue" without touching any other field first would see a
  // still-disabled button even though the file was actually accepted.
  const watchedValues = useWatch({ control, name: fieldNames });
  const values: Record<string, string | string[]> = {};
  fieldNames.forEach((name, i) => {
    values[name] = watchedValues[i];
  });

  const isLastStep = step === totalSteps - 1;

  const handleNext = async () => {
    const valid = await trigger(fieldNames);
    if (!valid) return;

    if (isLastStep) {
      onSubmit();
      return;
    }

    next();
  };

  const isStepValid = (() => {
    if (currentStep.inputType === "mixed") {
      return currentStep.fields.every((f) => {
        if (f.validation?.required) {
          const v = values[f.id];
          return Array.isArray(v) ? v.length > 0 : Boolean(v);
        }
        return true;
      });
    }

    if (currentStep.inputType === "tile-multi") {
      return (values[currentStep.fieldId] || []).length > 0;
    }

    return true;
  })();

  return (
    <div className="flex gap-4 mt-6">
      {step > 0 && (
        <button
          type="button"
          onClick={back}
          className="max-sm:hidden text-black dark:text-white border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-hint/40 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300"
        >
          Back
        </button>
      )}

      <button
        type="button"
        onClick={handleNext}
        disabled={!isStepValid}
        className={`${isStepValid ? "bg-primary text-white hover:bg-primary/90 cursor-pointer" : "bg-hint/30 text-hint dark:bg-muted/30 dark:text-muted cursor-not-allowed"} shadow-sm flex items-center justify-center gap-2 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300`}
      >
        {isLastStep ? "Submit" : "Continue"}
      </button>
    </div>
  );
}
