import {useFormContext} from "@mcc/utils";
import {formSteps} from "../constants/formSteps";
import OnboardingForm from "./OnboardingForm";

export function OnboardingContent({step}: {step: number}) {
  const {watch} = useFormContext();
  const name = watch("nickname");
  const currentStep = formSteps[step];

  return (
    <div className="flex flex-col gap-10">
      <div className="text-center">
        <p className="text-xl font-bold max-sm:*:text-lg">
          {step === 0 ? (
            <>
              Hey {name ? <span className="capitalize">{name}</span> : "there"},
              lets personalize your experience.
            </>
          ) : (
            currentStep?.question
          )}
        </p>
        <p className="text-sm text-muted">Help us customize MCC for you</p>
      </div>

      <OnboardingForm step={step} data={formSteps} />
    </div>
  );
}
