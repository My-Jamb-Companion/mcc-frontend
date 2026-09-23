import type {ReactNode} from "react";

export function Section({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
          {description && <p className="mt-1 text-base text-neutral-700">{description}</p>}
        </div>
        {aside}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function AccountantNote({decision}: {decision: string}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
      Confirm with your accountant · {decision}
    </span>
  );
}

export function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  error,
  disabled,
  readOnly,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-medium text-neutral-900">
        {label}
      </label>
      <div
        className={`flex items-center rounded-xl border bg-white px-3 transition-colors focus-within:border-violet-500 ${
          error ? "border-red-300" : "border-neutral-200"
        } ${disabled ? "opacity-50" : ""}`}
      >
        {prefix && <span className="pr-2 text-base text-neutral-600">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-2.5 text-base tabular-nums text-neutral-900 outline-none read-only:text-neutral-700"
        />
        {suffix && <span className="pl-2 text-base text-neutral-600">{suffix}</span>}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-neutral-600">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function ChoiceGroup<T extends string>({
  name,
  value,
  options,
  onChange,
  error,
  readOnly,
}: {
  name: string;
  value: T | "";
  options: {value: T; label: string; description: string}[];
  onChange: (value: T) => void;
  error?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition-colors ${
                checked ? "border-violet-500 bg-violet-50/60" : "border-neutral-200 hover:border-neutral-300"
              } ${readOnly ? "pointer-events-none" : ""}`}
            >
              <span className="flex items-center gap-2 text-base font-semibold text-neutral-900">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={checked}
                  disabled={readOnly && !checked}
                  onChange={() => onChange(option.value)}
                  className="accent-violet-600"
                />
                {option.label}
              </span>
              <span className="text-sm text-neutral-700">{option.description}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
