"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "@mcc/features";
import { Button, Icon, LoadingCircle } from "@mcc/ui";
import { formSteps } from "../constants/formSteps";
import { extractDefaults } from "../constants/extract";
import { FormValues } from "../types/formTypes";
import { getDraftFromStorage, saveDraftToStorage } from "../constants/storage";
import {
  OnboardingProvider,
  useOnboardingContext,
} from "../context/OnboardingContext";
import { OnboardingContent } from "./OnboardingContent";
import { StepNavigation } from "./FormStepsNav";
import ProgressBar from "./progressBar";

function PreviewComplete() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center pt-20 max-sm:pt-5 text-center">
      <div className="max-w-132.5 w-full flex flex-col gap-4 items-center">
        <div className="dark:bg-muted bg-hint/40 p-6 rounded-full w-fit">
          <Icon icon="mdi:check-circle-outline" size={48} />
        </div>
        <h2 className="text-xl font-bold">You&apos;ve previewed the full wizard</h2>
        <p className="text-muted text-sm">
          That&apos;s everything a real teacher fills in during onboarding. Nothing here was
          saved — log in with a real account to complete it for real.
        </p>
        <Button variant="primary" width="full" onClick={() => router.push("/login")}>
          Back to login
        </Button>
      </div>
    </div>
  );
}

function OnboardingInner({ preview }: { preview: boolean }) {
  const {
    step,
    totalSteps,
    nextStep,
    prevStep,
    handleSubmit,
    isSubmitting,
    previewComplete,
  } = useOnboardingContext();

  const methods = useForm<FormValues>({
    defaultValues: {
      ...extractDefaults(formSteps),
      ...(getDraftFromStorage(preview)?.values ?? {}),
    },
    mode: "onChange",
  });

  useEffect(() => {
    const subscription = methods.watch((values) => saveDraftToStorage(step, values, preview));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, preview]);

  // Persist the step number immediately on navigation too -- the watch
  // subscription above only fires on a *field value* change, so moving to
  // the Availability step (which has no schema fields of its own) would
  // otherwise never flush the new step index to storage until some other
  // field changed, and a refresh would silently drop the user back a step.
  useEffect(() => {
    saveDraftToStorage(step, methods.getValues(), preview);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, preview]);

  if (previewComplete) {
    return <PreviewComplete />;
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
          {/* Deliberately a <div>, not a <form>: the Availability step embeds
              the real AvailabilityManager, which has its own <form> for
              adding a slot. Nesting a <form> inside a <form> is invalid HTML
              and causes unpredictable submit behavior (a click inside the
              inner form can submit the outer one instead). Final submission
              is triggered programmatically via methods.handleSubmit below,
              not native form submission. */}
          <div>
            <OnboardingContent step={step} preview={preview} />

            {isSubmitting ? (
              <LoadingCircle className="mx-auto mt-8" />
            ) : (
              <StepNavigation
                step={step}
                totalSteps={totalSteps}
                currentStep={formSteps[step]}
                next={nextStep}
                back={prevStep}
                onSubmit={() => methods.handleSubmit(handleSubmit)()}
                submitLabel={preview ? "Finish preview" : "Submit"}
              />
            )}
          </div>
        </FormProvider>
      </div>
    </div>
  );
}

export default function Onboarding({ preview = false }: { preview?: boolean }) {
  return (
    <OnboardingProvider preview={preview}>
      <OnboardingInner preview={preview} />
    </OnboardingProvider>
  );
}
