import {useFormContext} from "@mcc/utils";
import {TileMultiStep} from "../types/formTypes";
import {Icon} from "@mcc/ui";

export function TileMultiRenderer({step}: {step: TileMultiStep}) {
  const {setValue, watch} = useFormContext();

  const selected: string[] = watch(step.fieldId) || [];

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      setValue(
        step.fieldId,
        selected.filter((v) => v !== value),
      );
    } else {
      setValue(step.fieldId, [...selected, value]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {step.options.map((opt) => {
          const isSelected = selected.includes(opt.value);

          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => toggleOption(opt.value)}
              className={`py-4.5 px-5 border border-hint/40 shadow-md rounded-xl transition flex items-center gap-1 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
                isSelected ? "bg-primary-gradient text-white" : ""
              }`}
            >
              <span>
                {opt.icon && (
                  <Icon icon={String(opt.icon)} width="24" height="24" />
                )}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
