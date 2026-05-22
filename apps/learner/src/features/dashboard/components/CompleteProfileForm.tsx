"use client";

import {FormProvider, useForm} from "@mcc/features";
import {Button, Icon, LoadingCircle} from "@mcc/ui";
import {useState} from "react";
import StepOne from "./completeProfileSteps/StepOne";
import StepTwo from "./completeProfileSteps/StepTwo";
import StepThree, {AvatarValue} from "./completeProfileSteps/StepThree";
import ProfileComplete from "./completeProfileSteps/ProfileComplete";

export type PhoneValue = {
  code: string;
  number: string;
};

export type FormValues = {
  fullName: string;
  email: string;
  phone: PhoneValue;
  gender: string;

  country: string;
  state: string;
  city: string;
  street: string;

  avatar?: AvatarValue;
};

export default function CompleteProfileForm({close}: {close?: () => void}) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<FormValues>({
    shouldUnregister: false,

    defaultValues: {
      fullName: "",
      email: "",

      gender: "",

      phone: {
        code: "+234",
        number: "",
      },

      country: "",
      state: "",
      city: "",
      street: "",

      avatar: {
        type: "preset",
        value: "",
      },
    },
  });

  const {handleSubmit, trigger, getValues, watch} = methods;

  const watched = watch();

  const isStepOneValid =
    watched.fullName &&
    watched.email &&
    watched.gender &&
    watched.phone?.number?.length >= 8;

  const isStepTwoValid =
    watched.country && watched.state && watched.city && watched.street;

  const isStepThreeValid = watched.avatar?.value;

  const isCurrentStepValid =
    step === 1
      ? isStepOneValid
      : step === 2
        ? isStepTwoValid
        : isStepThreeValid;

  const handleNext = async () => {
    let valid = false;

    if (step === 1) {
      valid = await trigger(["fullName", "email", "phone", "gender"]);

      if (!valid) return;

      const data = getValues();

      console.log("SAVE STEP 1", data);

      // await api.saveStepOne(data);

      setStep(2);
    }

    if (step === 2) {
      valid = await trigger(["country", "state", "city", "street"]);

      if (!valid) return;

      const data = getValues();

      console.log("SAVE STEP 2", data);

      // await api.saveStepTwo(data);

      setStep(3);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      console.log("FINAL SUBMIT", data);
      setStep(4);
    }, 5000);

    // await api.completeProfile(data);
  };

  const stepMeta = {
    1: {
      icon: "ri:user-line",
      title: "Complete your profile",
      desc: "We would like to learn more about you to help personalize your account.",
    },

    2: {
      icon: "ri:user-location-line",
      title: "Where are you located?",
      desc: "We need this to help you track your performance within your neighborhood.",
    },

    3: {
      icon: "ri:image-circle-line",
      title: "Add a photo",
      desc: "Don’t be a stranger, lets see the face behind the brilliant performance.",
    },
  };

  return (
    <>
      {step !== 4 && (
        <FormProvider {...methods}>
          <section>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">
                Complete all 3 sections of your profile
              </p>

              <div className="w-full rounded-full bg-muted/50 h-1">
                <div
                  className="rounded-full bg-btn-primary h-1 transition-all duration-300"
                  style={{
                    width: `${(step / 3) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-5">
              <div className="p-3 rounded-xl border border-muted/40 w-fit">
                <Icon icon={stepMeta[step as 1 | 2 | 3].icon} />
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-semibold text-2xl">
                  {stepMeta[step as 1 | 2 | 3].title}
                </p>

                <p className="text-subtle">
                  {stepMeta[step as 1 | 2 | 3].desc}
                </p>
              </div>
            </div>

            <div className="pt-5 flex flex-col gap-5">
              {step === 1 && <StepOne />}

              {step === 2 && <StepTwo />}

              {step === 3 && <StepThree userName={watched.fullName} />}

              <div className="flex items-center gap-4 pt-5">
                <Button variant="outline" onClick={close} className="w-[30%]!">
                  Cancel
                </Button>
                {step < 3 ? (
                  <Button
                    type="button"
                    variant={isCurrentStepValid ? "primary" : "secondary"}
                    disabled={!isCurrentStepValid}
                    onClick={handleNext}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={submitting}
                    loader={<LoadingCircle />}
                    onClick={handleSubmit(onSubmit)}
                    variant={isCurrentStepValid ? "primary" : "secondary"}
                    disabled={!isCurrentStepValid}
                  >
                    Complete Profile
                  </Button>
                )}
              </div>
            </div>
          </section>
        </FormProvider>
      )}

      {step === 4 && (
        <ProfileComplete
          avatar={watched.avatar?.value || "/assets/images/profile.png"}
          click={close}
        />
      )}
    </>
  );
}
