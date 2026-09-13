import type { FormSteps } from "../types/formTypes";

/**
 * Builds react-hook-form's `defaultValues` from the step schema: an empty
 * string for every "mixed" step's text/select/file/photo-upload field (or
 * its declared `default`), an empty array for "checkbox-group" fields, and
 * an empty array for every "tile-multi" step's `fieldId`.
 *
 * "component" steps are skipped entirely -- Availability's data lives
 * server-side, not in FormValues.
 */
export function extractDefaults(
  steps: FormSteps,
): Record<string, string | string[]> {
  const defaults: Record<string, string | string[]> = {};

  steps.forEach((step) => {
    if (step.inputType === "mixed") {
      step.fields.forEach((field) => {
        if (field.inputType === "checkbox-group") {
          defaults[field.id] = [];
          return;
        }
        defaults[field.id] =
          "default" in field && field.default ? field.default : "";
      });
    }

    if (step.inputType === "tile-multi") {
      defaults[step.fieldId] = [];
    }
  });

  return defaults;
}
