export function extractDefaults(steps) {
  const defaults = {};

  steps.forEach((step) => {
    if (step.inputType === "mixed") {
      step.fields.forEach((field) => {
        if ("default" in field && field.default) {
          defaults[field.id] = field.default;
        } else {
          defaults[field.id] = "";
        }
      });
    }

    if (step.inputType === "tile-multi") {
      defaults[step.fieldId] = [];
    }
  });

  return defaults;
}
