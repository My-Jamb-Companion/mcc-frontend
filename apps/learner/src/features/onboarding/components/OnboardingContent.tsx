import {useFormContext} from "@mcc/utils";
import {formSteps} from "../constants/formSteps";
import OnboardingForm from "./OnboardingForm";
import {FormStep} from "../formTypes";

export function OnboardingContent({step}: {step: number}) {
  const {watch} = useFormContext();
  const name = watch("nickname");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-xl font-bold">
          Hey {name || "there"}, lets personalize your experience.
        </p>
        <p className="text-sm text-muted">Help us customize MCC for you</p>
      </div>

      <OnboardingForm step={step} data={formSteps} />
    </div>
  );
}
