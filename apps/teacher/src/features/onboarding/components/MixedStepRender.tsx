import { Controller, FormInputs, useFormContext } from "@mcc/features";
import { MixedStep } from "../types/formTypes";
import { CheckboxGroupField } from "./CheckboxGroupField";
import { FileUploadField } from "./FileUploadField";
import { ProfilePhotoField } from "./ProfilePhotoField";

export function MixedStepRenderer({
  step,
  preview,
}: {
  step: MixedStep;
  preview: boolean;
}) {
  const { control } = useFormContext();

  return (
    <div className="space-y-5">
      {step.fields.map((field) => {
        switch (field.inputType) {
          case "text":
            return (
              <Controller
                key={field.id}
                name={field.id}
                control={control}
                rules={field.validation}
                render={({ field: { onChange, value }, fieldState }) => (
                  <FormInputs
                    label={field.question}
                    type={field.htmlType ?? "text"}
                    placeholder={field.placeholder}
                    value={value}
                    onChange={onChange}
                    errors={fieldState.error}
                    inputClassName="text-black! dark:text-white!"
                  />
                )}
              />
            );

          case "select":
            return (
              <Controller
                key={field.id}
                name={field.id}
                control={control}
                rules={field.validation}
                render={({ field: { onChange, value }, fieldState }) => (
                  <FormInputs
                    label={field.question}
                    type="select"
                    options={field.options}
                    value={value}
                    onChange={onChange}
                    errors={fieldState.error}
                  />
                )}
              />
            );

          case "file":
            return (
              <Controller
                key={field.id}
                name={field.id}
                control={control}
                rules={field.validation}
                render={({ field: { onChange, value }, fieldState }) => (
                  <div>
                    <FileUploadField field={field} value={value} onChange={onChange} />
                    {fieldState.error?.message && (
                      <p className="text-start text-red-400 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            );

          case "checkbox-group":
            return (
              <Controller
                key={field.id}
                name={field.id}
                control={control}
                rules={field.validation}
                render={({ field: { onChange, value }, fieldState }) => (
                  <div>
                    <CheckboxGroupField field={field} value={value} onChange={onChange} />
                    {fieldState.error?.message && (
                      <p className="text-start text-red-400 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            );

          case "photo-upload":
            return (
              <Controller
                key={field.id}
                name={field.id}
                control={control}
                rules={field.validation}
                render={({ field: { onChange, value } }) => (
                  <ProfilePhotoField
                    field={field}
                    value={value}
                    onChange={onChange}
                    preview={preview}
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
