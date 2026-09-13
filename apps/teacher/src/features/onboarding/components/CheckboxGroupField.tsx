import { CheckboxGroupField as CheckboxGroupFieldType } from "../types/formTypes";

export function CheckboxGroupField({
  field,
  value,
  onChange,
}: {
  field: CheckboxGroupFieldType;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const selected = value || [];

  const toggle = (optionValue: string) => {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
    } else {
      onChange([...selected, optionValue]);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-start text-sm">{field.question}</label>
      <div className="flex flex-wrap gap-2">
        {field.options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={`px-3.5 py-2 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                isSelected
                  ? "bg-btn-primary text-white border-btn-primary"
                  : "border-muted/30 text-muted hover:bg-muted/10"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
