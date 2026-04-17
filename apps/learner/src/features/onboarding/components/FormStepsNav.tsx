import {useFormContext} from "@mcc/utils";
import {FormStep} from "../types/formTypes";

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
  const {trigger, getValues} = useFormContext();

  const handleNext = async () => {
    let fields: string[] = [];

    if (currentStep.inputType === "mixed") {
      fields = currentStep.fields.map((f) => f.id);
    }

    if (currentStep.inputType === "tile-multi") {
      fields = [currentStep.fieldId];
    }

    const valid = await trigger(fields);
    if (!valid) return;

    if (step === totalSteps - 1) {
      console.log("FINAL DATA:", getValues());
      return;
    }

    next();
  };

  const values = getValues();

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
          className="text-black dark:text-white border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-hint/40 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300"
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
