import {useEffect, useRef, useState} from "react";
import {AnimatePresence, Icon, motion} from "@mcc/ui";
import {FieldError, UseFormRegisterReturn} from "@mcc/features";

const FormInputs = ({
  label,
  errors,
  className,
  inputClassName,
  registration,
  type = "text",
  options = [],
  placeholder,
  icon,
  isPassword = false,
  value,
  onChange,
  inputProps,
}: inputProps) => {
  const [show, setShow] = useState(false);
  const id = registration?.name;

  const inputClass = `w-full border border-muted/20 rounded-md p-2 text-sm text-muted outline-none  ${
    icon ? "pl-9" : "px-3"
  } ${isPassword ? "pr-10" : "pr-3"} ${inputClassName} ${errors?.message ? "ring-2 ring-danger/50 focus:ring-danger/50" : "focus:ring-2 ring-primary/50 focus:ring-primary/30"}`;
  const resolvedType = isPassword ? (show ? "text" : "password") : type;

  const renderInput = () => {
    if (type === "textarea") {
      return (
        <textarea
          id={id}
          placeholder={placeholder}
          className={inputClass}
          {...registration}
        />
      );
    }
    if (type === "select") {
      return (
        <CustomSelect
          options={options}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          error={errors?.message}
        />
      );
    }

    return (
      <input
        id={id}
        type={resolvedType}
        placeholder={placeholder}
        className={inputClass}
        {...inputProps}
        {...registration}
      />
    );
  };

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <label htmlFor={id} className="text-start text-sm">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        {renderInput()}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <Icon
              icon={show ? "ph:eye-slash" : "ph:eye"}
              size={16}
              className={
                errors?.message ? "var(--color-danger)" : "var(--color-muted)"
              }
            />
          </button>
        )}
      </div>
      {errors && <Err message={errors?.message || ""} />}
    </div>
  );
};

const Err = ({message}: {message?: string}) => {
  return (
    <motion.p
      key={message}
      initial={{opacity: 0, scale: 0}}
      animate={{opacity: 1, scale: 1}}
      className="text-start text-red-400 text-xs"
    >
      {message}
    </motion.p>
  );
};
export default FormInputs;

type inputProps = {
  label: string;
  errors?: FieldError;
  className?: string;
  inputClassName?: string;
  registration?: UseFormRegisterReturn;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "textarea"
    | "select";
  options?: {label: string; value: string}[];
  placeholder?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

interface SelectOption {
  value: string;
  icon?: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  error,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className={`relative w-full flex flex-col gap-4 ${error ? " border border-danger!" : ""}`}
    >
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm border rounded-lg bg-white dark:bg-hint dark:border-0 dark:text-white outline-none
          ${open ? " border-zinc-300 shadow-md" : " border-zinc-200"}
          ${selected ? "text-zinc-900" : "text-zinc-400"}`}
        >
          {selected ? (
            <span className="flex items-center gap-2.5">{selected.label}</span>
          ) : (
            placeholder
          )}
          <Icon
            icon="line-md:chevron-up"
            size={15}
            className={`text-zinc-400 transition-transform duration-200 ${open ? "" : "rotate-180"}`}
          />
        </button>
      </div>
      <AnimatePresence mode="wait">
        {open && (
          <motion.ul
            key="dropdown"
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 100}}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="bg-white dark:bg-zinc-800 border border-hint/30  rounded-lg overflow-hidden shadow-lg absolute left-0 top-full mt-2 w-full z-10"
          >
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
                className={`flex items-start gap-2.5 px-3.5 py-2.5 text-sm text-zinc-800 dark:text-white cursor-pointer transition-colors
                ${value === opt.value ? "bg-zinc-50 dark:bg-muted/70" : "hover:bg-zinc-50 dark:hover:bg-muted/80"}`}
              >
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
