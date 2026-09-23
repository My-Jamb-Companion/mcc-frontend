import { Icon } from "@mcc/ui";
import { formSteps } from "../constants/formSteps";
import { Field, FormValues, Option } from "../types/formTypes";

function optionLabel(options: Option[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}

function FieldValue({ field, value }: { field: Field; value: string | string[] | undefined }) {
  const isEmpty = !value || (Array.isArray(value) && value.length === 0);
  if (isEmpty) {
    return <span className="text-muted italic">Not provided</span>;
  }

  if (field.inputType === "select") {
    return <span>{optionLabel(field.options, value as string)}</span>;
  }

  if (field.inputType === "checkbox-group") {
    return <span>{(value as string[]).map((v) => optionLabel(field.options, v)).join(", ")}</span>;
  }

  if (field.inputType === "file") {
    return (
      <span className="inline-flex items-center gap-1">
        <Icon icon="mdi:file-check-outline" size={14} />
        {value as string}
      </span>
    );
  }

  if (field.inputType === "photo-upload") {
    return <img src={value as string} alt="" className="h-12 w-12 rounded-full object-cover" />;
  }

  return <span className="whitespace-pre-wrap">{value as string}</span>;
}

/** Read-only rendering of a completed onboarding submission, driven by the
 * same `formSteps` schema the wizard itself uses -- so it never drifts out
 * of sync with what was actually asked. */
export function SubmittedDataView({ values }: { values: FormValues }) {
  return (
    <div className="flex flex-col gap-8 text-left">
      {formSteps.map((step) => {
        if (step.inputType === "component") {
          return (
            <div key={step.id}>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted">Managed separately — see the Availability tab.</p>
            </div>
          );
        }

        if (step.inputType === "tile-multi") {
          const selected = (values[step.fieldId] as string[] | undefined) ?? [];
          return (
            <div key={step.id}>
              <h3 className="font-semibold mb-2">{step.question}</h3>
              <p className="text-sm">
                {selected.length ? (
                  selected.map((v) => optionLabel(step.options, v)).join(", ")
                ) : (
                  <span className="text-muted italic">Not provided</span>
                )}
              </p>
            </div>
          );
        }

        return (
          <div key={step.id}>
            <h3 className="font-semibold mb-3">{step.title}</h3>
            <dl className="flex flex-col gap-3">
              {step.fields.map((field) => (
                <div key={field.id} className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted">{field.question}</dt>
                  <dd className="text-sm">
                    <FieldValue field={field} value={values[field.id]} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}
