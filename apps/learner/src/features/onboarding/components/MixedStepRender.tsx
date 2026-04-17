import {Controller, useFormContext} from "@mcc/utils";
import {MixedStep} from "../types/formTypes";
import FormInputs from "../../components/Forminputs";

export function MixedStepRenderer({step}: {step: MixedStep}) {
  const {register, control} = useFormContext();

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

          default:
            return null;
        }
      })}
    </div>
  );
}
