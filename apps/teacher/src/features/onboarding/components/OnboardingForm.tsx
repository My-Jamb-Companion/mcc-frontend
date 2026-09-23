import { FormStep } from "../types/formTypes";
import { StepRenderer } from "./StepRenderer";

type Props = {
  step: number;
  data: FormStep[];
  preview: boolean;
};

export default function OnboardingForm({ step, data, preview }: Props) {
  const currentStep = data[step];

  if (!currentStep) return null;

  return (
    <section className="w-full">
      <StepRenderer step={currentStep} preview={preview} />
    </section>
  );
}
