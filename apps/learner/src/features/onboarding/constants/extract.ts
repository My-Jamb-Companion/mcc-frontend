import type { FormSteps } from "../types/formTypes";

/**
 * Builds react-hook-form's `defaultValues` from the step schema: an empty
 * string for every "mixed" step's field (or its declared `default`), and an
 * empty array for every "tile-multi" step's `fieldId`.
 *
 * Field ids and step fieldIds are free-form strings in FormStep, not keys
 * literally tied to FormValues, so the result is typed by what is actually
 * guaranteed rather than asserted to match FormValues exactly.
 */
export function extractDefaults(
  steps: FormSteps,
): Record<string, string | string[] | unknown[]> {
  const defaults: Record<string, string | string[] | unknown[]> = {};

  steps.forEach((step) => {
    if (step.inputType === "mixed") {
      step.fields.forEach((field) => {
        defaults[field.id] =
          "default" in field && field.default ? field.default : "";
      });
    }

    if (step.inputType === "tile-multi") {
      defaults[step.fieldId] = [];
      if (step.otherFieldId) {
        defaults[step.otherFieldId] = "";
      }
    }

    if (step.inputType === "course-select") {
      defaults[step.fieldId] = [];
    }
  });

  return defaults;
}
