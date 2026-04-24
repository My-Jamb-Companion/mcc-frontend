"use client";

import {useState} from "react";
import {formSteps} from "../constants/formSteps";
import ProgressBar from "./progressBar";
import {StepNavigation} from "./FormStepsNav";
import {extractDefaults} from "../constants/extract";
import {OnboardingContent} from "./OnboardingContent";
import {FormValues} from "../types/formTypes";
import {useRouter} from "next/navigation";
import {Icon, LoadingCircle} from "@mcc/ui";
import {FormProvider, useForm} from "@mcc/features";

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
    if(data){
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/onboarding/free");
    }, 3000);
    }
  };

  const currentStep = formSteps[step];

  return (
    <div className="flex flex-col items-center pt-20 max-sm:pt-5">
      <div className="max-w-132.5 w-full flex flex-col gap-10">
        <div className="flex items-center relative max-sm:h-9">
          {step !== 0 && (
            <button
              onClick={() => prevStep()}
              className="absolute top-0 left-0 z-10 rounded-full p-2 border-2 shadow-md border-muted/55 active:scale-95 w-fit sm:hidden"
            >
              <Icon icon="material-symbols:arrow-back-rounded" size={16} />
            </button>
          )}
          <ProgressBar
            step={isLoading ? formSteps.length : step}
            totalSteps={formSteps.length}
            className="w-full max-sm:w-[30%] max-sm:mx-auto"
          />
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <OnboardingContent step={step} />
            {isLoading ? (
              <LoadingCircle className="mx-auto mt-8" />
            ) : (
              <StepNavigation
                step={step}
                totalSteps={formSteps.length}
                currentStep={currentStep}
                next={nextStep}
                back={prevStep}
              />
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
