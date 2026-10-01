import {useFormContext} from "@mcc/features";
import {FormStep, SelectedOnboardingItem} from "../types/formTypes";

export function StepNavigation({
  step,
  totalSteps,
  currentStep,
  next,
  back,
}: {
  step: number;
  totalSteps: number;
  currentStep: FormStep;
  next: () => void;
  back: () => void;
}) {
  const {trigger, getValues, watch} = useFormContext();
  // Subscribes this component to every field change (not just tile
  // selections) so isStepValid re-evaluates live as the student types --
  // getValues() alone is a one-off snapshot with no reactivity, which left
  // the "other" text field's Continue/Submit gate stuck showing stale
  // (usually disabled) state until some unrelated re-render happened to
  // occur.
  const values = watch();

  const handleNext = async () => {
    let fields: string[] = [];

    if (currentStep.inputType === "mixed") {
      fields = currentStep.fields.map((f) => f.id);
    }

    if (currentStep.inputType === "tile-multi") {
      fields = currentStep.otherFieldId
        ? [currentStep.fieldId, currentStep.otherFieldId]
        : [currentStep.fieldId];
    }

    if (currentStep.inputType === "course-select") {
      fields = [currentStep.fieldId];
    }

    const valid = await trigger(fields);
    if (!valid) return;

    if (step === totalSteps - 1) {
      return;
    }

    next();
  };

  const isStepValid = (() => {
    if (currentStep.inputType === "mixed") {
      return currentStep.fields.every((f) => {
        if (f.validation?.required) {
          return values[f.id];
        }
        return true;
      });
    }

    if (currentStep.inputType === "tile-multi") {
      const selected: string[] = values[currentStep.fieldId] || [];
      if (selected.length === 0) return false;
      if (currentStep.otherFieldId && selected.includes("other")) {
        const otherText: string = values[currentStep.otherFieldId] || "";
        return otherText.trim().length > 0;
      }
      return true;
    }

    if (currentStep.inputType === "course-select") {
      const selected: SelectedOnboardingItem[] = values[currentStep.fieldId] || [];
      // A paid-only selection doesn't satisfy this -- only a free item's
      // enrollment is guaranteed synchronous and active immediately.
      return selected.some((item) => item.price === 0);
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
        type={step === totalSteps - 1 ? "submit" : "button"}
        onClick={step === totalSteps - 1 ? undefined : handleNext}
        disabled={!isStepValid}
        className={`${isStepValid ? "bg-primary text-white hover:bg-primary/90 cursor-pointer" : "bg-hint/30 text-hint dark:bg-muted/30 dark:text-muted cursor-not-allowed"} shadow-sm flex items-center justify-center gap-2 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300`}
      >
        {step === totalSteps - 1 ? "Submit" : "Continue"}
      </button>
    </div>
  );
}
