import {Controller, FormInputs, useFormContext} from "@mcc/features";
import {useConsentState} from "@/src/features/consent/hooks/useConsent";
import {isUnder18, todayIso} from "@/src/features/consent/helper/age";
import {MixedStep} from "../types/formTypes";

export function MixedStepRenderer({step}: {step: MixedStep}) {
  const {register, control, watch} = useFormContext();
  // A parent who created this account has already recorded the date of birth; don't ask the child again.
  const {data: consent} = useConsentState();
  const ageKnown = Boolean(consent?.age_known);
  const minor = isUnder18(watch("dateOfBirth") ?? "");

  return (
    <div className="space-y-5">
      {step.fields.map((field) => {
        switch (field.inputType) {
          case "text":
            return (
              <FormInputs
                key={field.id}
                label={field.question}
                type="text"
                placeholder={field.placeholder}
                registration={register(field.id, field.validation)}
                inputClassName="text-black! dark:text-white!"
              />
            );

          case "select":
            return (
              <Controller
                key={field.id}
                name={field.id}
                control={control}
                rules={field.validation}
                render={({field: {onChange, value}}) => (
                  <FormInputs
                    key={field.id}
                    label={field.question}
                    type="select"
                    options={field.options}
                    value={value}
                    onChange={(val) => onChange(val)}
                  />
                )}
              />
            );

          case "date-of-birth":
            if (ageKnown) return null;
            return (
              <FormInputs
                key={field.id}
                label={field.question}
                type="text"
                inputProps={{type: "date", max: todayIso()}}
                registration={register(field.id, field.validation)}
                inputClassName="text-black! dark:text-white!"
              />
            );

          case "guardian-email":
            if (ageKnown || !minor) return null;
            return (
              <div key={field.id} className="space-y-2">
                <p className="text-xs text-muted">
                  Because you&apos;re under 18, a parent or guardian needs to approve your account. We&apos;ll email
                  them a link. Until they do, you can use free learning, but payments, Brainy, live classes and the
                  leaderboard stay switched off.
                </p>
                <FormInputs
                  label={field.question}
                  type="email"
                  registration={register(field.id)}
                  inputClassName="text-black! dark:text-white!"
                />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
