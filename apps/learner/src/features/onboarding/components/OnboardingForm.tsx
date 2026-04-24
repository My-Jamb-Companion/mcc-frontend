import {FormStep} from "../types/formTypes";
import {StepRenderer} from "./StepRenderer";

type Props = {
  step: number;
  data: FormStep[];
};

export default function OnboardingForm({step, data}: Props) {
  const currentStep = data[step];

  if (!currentStep) return null;

  return (
    <section className="w-full">
      <StepRenderer step={currentStep} />
    </section>
  );
}
