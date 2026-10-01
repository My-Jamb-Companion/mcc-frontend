export type SelectedOnboardingItem = {
  id: string;
  kind: "course" | "program";
  price: number;
};

export type FormValues = {
  nickname: string;
  language: string;
  role: string;
  referral: string[];
  referralOther: string;
  purpose: string[];
  purposeOther: string;
  selectedItems: SelectedOnboardingItem[];
};

// Shared types
export type Validation = {
  required?: string;
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
};

export type TextField = BaseField & {
  inputType: "text";
  placeholder?: string;
};

export type SelectField = BaseField & {
  inputType: "select";
  options: Option[];
  default?: string;
};

export type Field = TextField | SelectField;

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
  /** When set, selecting the "other" option opens a required text field
   * bound to this field id (e.g. "referralOther"). */
  otherFieldId?: string;
};

export type CourseSelectStep = {
  id: string;
  inputType: "course-select";
  fieldId: "selectedItems";
  question: string;
  validation: Validation;
};

// Union of all steps
export type FormStep = MixedStep | TileMultiStep | CourseSelectStep;

// Full structure
export type FormSteps = FormStep[];
