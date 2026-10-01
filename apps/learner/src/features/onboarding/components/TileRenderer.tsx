import {useFormContext} from "@mcc/features";
import {TileMultiStep} from "../types/formTypes";
import {Icon} from "@mcc/ui";

export function TileMultiRenderer({step}: {step: TileMultiStep}) {
  const {setValue, watch, register} = useFormContext();

  const selected: string[] = watch(step.fieldId) || [];
  const showOther = step.otherFieldId && selected.includes("other");

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      const next = selected.filter((v) => v !== value);
      setValue(step.fieldId, next);
      // Clear stale "other" text once that tile is deselected, so it
      // can't linger unselected and get submitted anyway.
      if (value === "other" && step.otherFieldId) {
        setValue(step.otherFieldId, "");
      }
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
              // onClick={() => isLoading ? undefined : toggleOption(opt.value)}
              onClick={() => toggleOption(opt.value)}
              className={`py-4.5 px-5 border border-hint/40 shadow-md rounded-xl transition flex items-center gap-1 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-hint dark:shadow-md dark:shadow-hint ${
                isSelected ? "bg-primary-gradient text-white" : ""
              }`}
            >
              <span>
                {opt.icon && <Icon icon={String(opt.icon)} size={24} />}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {showOther && (
        <input
          type="text"
          autoFocus
          placeholder="Tell us more"
          {...register(step.otherFieldId as string, {required: true})}
          className="w-full rounded-xl border border-hint/40 px-5 py-3.5 text-sm shadow-md outline-none focus:border-primary/50 dark:border-hint dark:shadow-hint"
        />
      )}
    </div>
  );
}
