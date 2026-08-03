import {Controller, FormInputs, useFormContext} from "@mcc/features";
import {Button, Icon} from "@mcc/ui";
import {useState} from "react";
import {CoursesFormValues} from "../CreateCourse";

export default function CreateDetails({onNext}: {onNext: () => void}) {
  const {
    register,
    control,
    trigger,
    formState: {errors, isValid},
  } = useFormContext<CoursesFormValues>();

  async function handleNext() {
    // Scope validation to this step's fields only, so an untouched Step2/3
    // field never blocks moving off Step1.
    const valid = await trigger([
      "courseName",
      "category",
      "instructor",
      "price",
      "level",
      "description",
      "learnItems",
      "tags",
    ]);
    if (valid) onNext();
  }
  console.log(isValid, errors);
  return (
    <div className="mt-5 rounded-xl border border-muted/20 p-6">
      <div className="flex flex-col gap-6">
        {/* Row 1 â€” Exam & Subject */}
        <div className="py-10 px-7 bg-primary rounded-2xl">
          <FormInputs
            type="text"
            placeholder="Course name"
            inputClassName="!text-2xl placeholder:text-white text-white"
            registration={register("courseName", {
              required: "Course name is required",
              minLength: {
                value: 3,
                message: "Course name must be at least 3 characters",
              },
              maxLength: {
                value: 100,
                message: "Course name must be at most 100 characters",
              },
            })}
            errors={errors.courseName}
          />
        </div>

        {/* Row 2 â€” Category, Instructor, Price */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Controller
            name="category"
            control={control}
            rules={{required: "Please select a category"}}
            render={({field}) => (
              <FormInputs
                type="select"
                label="Category"
                placeholder="Select category"
                selectRadius="xl"
                selectClassName="py-4"
                options={CATEGORY_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                errors={errors.category}
                icon={
                  <Icon
                    icon="lucide:box"
                    size={16}
                    className="text-orange-400"
                  />
                }
              />
            )}
          />

          <Controller
            name="instructor"
            control={control}
            rules={{required: "Please select an instructor"}}
            render={({field}) => (
              <FormInputs
                type="select"
                label="Instructor"
                placeholder="Select instructor"
                selectRadius="xl"
                selectClassName="py-4"
                options={INSTRUCTOR_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                errors={errors.instructor}
                icon={
                  <Icon
                    icon="lucide:graduation-cap"
                    size={16}
                    className="text-emerald-400"
                  />
                }
              />
            )}
          />

          <FormInputs
            type="number"
            label="Price"
            placeholder="0"
            inputClassName="py-4 rounded-xl"
            registration={register("price", {
              required: "Price is required",
              min: {value: 0, message: "Price must be 0 or more"},
            })}
            errors={errors.price}
          />
        </div>

        {/* Level */}
        <Controller
          name="level"
          control={control}
          rules={{required: "Please select a level"}}
          render={({field}) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">
                <span className="text-red-500">*</span> Level
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {LEVELS.map((lvl) => {
                  const selected = field.value === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => field.onChange(lvl.id)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-5 text-sm font-medium transition-colors ${
                        selected
                          ? "border-violet-600 text-gray-900 ring-1 ring-violet-600"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                            selected ? "border-violet-600" : "border-gray-300"
                          }`}
                        >
                          {selected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
                          )}
                        </span>
                        {lvl.label}
                      </span>
                      <LevelDial fill={lvl.fill} />
                    </button>
                  );
                })}
              </div>
              {errors.level && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.level.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Description */}
        <div>
          <FormInputs
            type="textarea"
            label="Description"
            placeholder="What is this program about?"
            inputClassName="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300"
            registration={register("description", {
              required: "Description is required",
              minLength: {
                value: 20,
                message: "Description must be at least 20 characters",
              },
            })}
            errors={errors.description}
          />
        </div>

        {/* Learn items */}
        <Controller
          name="learnItems"
          control={control}
          rules={{
            validate: (v) =>
              v.length > 0 || "Add at least one learning outcome",
          }}
          render={({field}) => (
            <ChipInput
              label="What will students learn?"
              max={5}
              chips={field.value}
              onChange={field.onChange}
              error={errors.learnItems?.message}
            />
          )}
        />

        {/* Tags */}
        <Controller
          name="tags"
          control={control}
          rules={{
            validate: (v) => v.length > 0 || "Add at least one tag",
          }}
          render={({field}) => (
            <ChipInput
              label="Tags"
              max={5}
              chips={field.value}
              onChange={field.onChange}
              error={errors.tags?.message}
            />
          )}
        />
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
        <button
          type="button"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <Button type="button" variant={"outline"}>
            Save as draft
          </Button>
          <Button
            type="button"
            variant={isValid ? "primary" : "secondary"}
            onClick={handleNext}
            // disabled={!isValid}
          >
            Save &amp; continue
          </Button>
        </div>
      </div>
    </div>
  );
}

// SUB-COMPONENTS

function LevelDial({fill}: {fill: number}) {
  const r = 7;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" aria-hidden="true">
      <circle
        cx="9"
        cy="9"
        r={r}
        fill="none"
        stroke="#D1D5DB"
        strokeWidth={2}
      />
      {fill > 0 && (
        <circle
          cx="9"
          cy="9"
          r={r}
          fill="none"
          stroke="#111827"
          strokeWidth={2}
          strokeDasharray={`${c * fill} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 9 9)"
        />
      )}
    </svg>
  );
}

function ChipInput({
  label,
  max,
  chips,
  onChange,
  error,
}: {
  label: string;
  max: number;
  chips: string[];
  onChange: (chips: string[]) => void;
  error?: string;
}) {
  const [input, setInput] = useState("");

  function addChip() {
    const clean = input.trim();
    if (!clean || chips.length >= max || chips.includes(clean)) return;
    onChange([...chips, clean]);
    setInput("");
  }
  function removeChip(chip: string) {
    onChange(chips.filter((c) => c !== chip));
  }

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-900">
        <span className="text-red-500">*</span>
        {label}
        <span className="font-normal text-gray-400">(Maximum {max})</span>
        <Icon icon="lucide:help-circle" size={14} className="text-gray-300" />
      </label>
      <div
        className={`flex flex-wrap items-center gap-2 rounded-xl border px-3.5 py-2.5 ${
          error ? "border-red-400 ring-2 ring-red-200" : "border-gray-200"
        }`}
      >
        {chips.map((chip) => (
          <span
            key={chip}
            className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
          >
            {chip}
            <button
              type="button"
              onClick={() => removeChip(chip)}
              aria-label={`Remove ${chip}`}
            >
              <Icon icon="lucide:x" size={12} className="text-gray-500" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addChip();
            }
          }}
          disabled={chips.length >= max}
          className="min-w-[60px] flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
        />
        {chips.length === 0 && (
          <span className="ml-auto shrink-0 text-xs text-gray-400">
            Press enter to add
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

const LEVELS = [
  {id: "all", label: "All levels", fill: 0},
  {id: "beginner", label: "Beginner", fill: 0.33},
  {id: "intermediate", label: "Intermediate", fill: 0.66},
  {id: "advanced", label: "Advanced", fill: 1},
] as const;

// Placeholder option lists â€” replace with real data when ready
const CATEGORY_OPTIONS = [
  {label: "Science", value: "science"},
  {label: "Arts", value: "arts"},
  {label: "Commerce", value: "commerce"},
];
const INSTRUCTOR_OPTIONS = [
  {label: "John Doe", value: "john_doe"},
  {label: "Jane Smith", value: "jane_smith"},
];
