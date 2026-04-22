import {Icon} from "@mcc/ui";
import {useState} from "react";
import {FieldError, UseFormRegisterReturn} from "react-hook-form";

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
}: Props) => {
  const [show, setShow] = useState(false);
  const id = registration.name;

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
        <select id={id} className={inputClass} {...registration}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        id={id}
        type={resolvedType}
        placeholder={placeholder}
        className={inputClass}
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
    <p key={message} className="text-start text-red-400 text-xs">
      {message}
    </p>
  );
};
export default FormInputs;

type Props = {
  label: string;
  errors?: FieldError;
  className?: string;
  inputClassName?: string;
  registration: UseFormRegisterReturn;
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
};
