import { formSteps } from "../constants/formSteps";
import OnboardingForm from "./OnboardingForm";

export function OnboardingContent({ step, preview }: { step: number; preview: boolean }) {
  const currentStep = formSteps[step];

  return (
    <div className="flex flex-col gap-10">
      <div className="text-center">
        <p className="text-xl font-bold max-sm:*:text-lg">{currentStep?.question}</p>
        <p className="text-sm text-muted">Help students find and trust you</p>
      </div>

      <OnboardingForm step={step} data={formSteps} preview={preview} />
    </div>
  );
}
