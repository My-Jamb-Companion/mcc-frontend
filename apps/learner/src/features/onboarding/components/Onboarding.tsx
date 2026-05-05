"use client";

import { FormProvider, useForm } from "@mcc/features";
import { Icon, LoadingCircle } from "@mcc/ui";
import { formSteps } from "../constants/formSteps";
import { extractDefaults } from "../constants/extract";
import { FormValues } from "../types/formTypes";
import {
  OnboardingProvider,
  useOnboardingContext,
} from "../context/OnboardingContext";
import { OnboardingContent } from "./OnboardingContent";
import { StepNavigation } from "./FormStepsNav";
import ProgressBar from "./progressBar";
import { CompletedWithCourse } from "./CompletedWithCourse";

function OnboardingInner() {
  const {
    step,
    totalSteps,
    nextStep,
    prevStep,
    handleSubmit,
    isSubmitting,
    isError,
    errorMessage,
    completedCourse,
  } = useOnboardingContext();

  const methods = useForm<FormValues>({
    defaultValues: extractDefaults(formSteps),
    mode: "onChange",
  });

  if (completedCourse) {
    return <CompletedWithCourse course={completedCourse} />;
  }

  return (
    <div className="flex flex-col items-center pt-20 max-sm:pt-5">
      <div className="max-w-132.5 w-full flex flex-col gap-10">
        <div className="flex items-center relative max-sm:h-9">
          {step !== 0 && !isSubmitting && (
            <button
              type="button"
              onClick={prevStep}
              className="absolute top-0 left-0 z-10 rounded-full p-2 border-2 shadow-md border-muted/55 active:scale-95 w-fit sm:hidden"
            >
              <Icon icon="material-symbols:arrow-back-rounded" size={16} />
            </button>
          )}
          <ProgressBar
            step={isSubmitting ? totalSteps : step}
            totalSteps={totalSteps}
            className="w-full max-sm:w-[30%] max-sm:mx-auto"
          />
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <OnboardingContent step={step} />

            {isError && (
              <p className="text-red-500 text-sm text-center mt-4">
                {errorMessage}
              </p>
            )}

            {isSubmitting ? (
              <LoadingCircle className="mx-auto mt-8" />
            ) : (
              <StepNavigation
                step={step}
                totalSteps={totalSteps}
                currentStep={formSteps[step]}
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

export default function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingInner />
    </OnboardingProvider>
  );
}
