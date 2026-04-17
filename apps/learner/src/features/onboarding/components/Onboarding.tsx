"use client";

import {FormProvider, useForm} from "@mcc/utils";
import {useState} from "react";
import {formSteps} from "../constants/formSteps";
import ProgressBar from "./progressBar";
import {StepNavigation} from "./FormStepsNav";
import {extractDefaults} from "../constants/extract";
import {OnboardingContent} from "./OnboardingContent";
import {FormValues} from "../types/formTypes";

export default function Onboarding() {
  const [step, setStep] = useState(0);

  const methods = useForm<FormValues>({
    defaultValues: extractDefaults(formSteps),
    mode: "onChange",
  });

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, formSteps.length - 1));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = (data: FormValues) => {
    console.log("SUBMITTED DATA:", data);
  };

  const currentStep = formSteps[step];

  return (
    <div className="flex flex-col items-center pt-20">
      <div className="max-w-132.5 w-full flex flex-col gap-10">
        <ProgressBar
          step={step}
          totalSteps={formSteps.length}
          className="w-full"
        />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <OnboardingContent step={step} />

            <StepNavigation
              step={step}
              totalSteps={formSteps.length}
              currentStep={currentStep}
              next={nextStep}
              back={prevStep}
            />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
