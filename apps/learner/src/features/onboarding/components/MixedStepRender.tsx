import {useFormContext} from "@mcc/utils";
import {MixedStep} from "../constants/formSteps";
import FormInputs from "../../components/Forminputs";

export function MixedStepRenderer({step}: {step: MixedStep}) {
  const {register} = useFormContext();

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
              />
            );

          case "select":
            return (
              <FormInputs
                key={field.id}
                label={field.question}
                type="select"
                options={field.options}
                registration={register(field.id, field.validation)}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
