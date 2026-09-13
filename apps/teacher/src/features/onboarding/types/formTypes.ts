export type FormValues = Record<string, string | string[]>;

// Shared types
export type Validation = {
  required?: string;
  minLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
};

export type Option = {
  value: string;
  label: string;
  icon?: string | React.ComponentType;
};

// ---- Field Types (used inside "mixed") ----
export type BaseField = {
  id: string;
  question: string;
  validation: Validation;
  helpText?: string;
};

export type TextField = BaseField & {
  inputType: "text";
  placeholder?: string;
  /** Passed through to FormInputs' `type` prop; "text" if omitted. */
  htmlType?: "text" | "tel" | "number" | "textarea";
};

export type SelectField = BaseField & {
  inputType: "select";
  options: Option[];
  default?: string;
};

/** Mocked -- no backend endpoint accepts a real upload here. Value stored is
 * the filename string, never the File object (not JSON-serializable). */
export type FileField = BaseField & {
  inputType: "file";
  accept?: string;
};

/** Compact multi-select chip group -- a secondary field inside a step, as
 * opposed to TileMultiStep's big icon-tile grid for a step's single
 * headline decision. */
export type CheckboxGroupField = BaseField & {
  inputType: "checkbox-group";
  options: Option[];
};

/** The one REAL field type: uploads via POST /user/profile/photo and stores
 * the real returned URL. */
export type PhotoUploadField = BaseField & {
  inputType: "photo-upload";
};

export type Field =
  | TextField
  | SelectField
  | FileField
  | CheckboxGroupField
  | PhotoUploadField;

// ---- Step Types ----
export type MixedStep = {
  id: string;
  title: string;
  question?: string;
  inputType: "mixed";
  fields: Field[];
};

export type TileMultiStep = {
  id: string;
  inputType: "tile-multi";
  fieldId: string;
  question: string;
  options: Option[];
  validation: Validation;
};

/** Wraps a real, already-built component (Availability) instead of a
 * field-schema. Its data lives server-side, not in FormValues. */
export type ComponentStep = {
  id: "availability";
  inputType: "component";
  title: string;
  question: string;
};

// Union of all steps
export type FormStep = MixedStep | TileMultiStep | ComponentStep;

// Full structure
export type FormSteps = FormStep[];
