"use client";
// import { Input } from '@/components/ui/input';
import {motion} from "framer-motion";
import {Eye, EyeOff} from "lucide-react";
import {useState} from "react";
import {FieldError} from "react-hook-form";

const FormInputs = ({
  label,
  errors,
  className,
  inputType,
  inputStyle,
  labelStyle,
  placeholder,
  value,
  setValue,
}: Props) => {
  const [show, setShow] = useState(false);
  return (
    <div className={`flex flex-col gap-2 w-full max-h-fit  ${className ?? ""}`}>
      <label
        className={`text-sm font-medium${labelStyle ?? ""}`}
        htmlFor={label}
      >
        {label}
      </label>
      <div className="flex items-center border-2 rounded-lg">
        <input
          type={
            inputType == "password" ? (show ? "text" : "password") : inputType
          }
          className={`flex h-9 w-full px-3 py-1 bg-transparent text-sm font-normal text-black ${inputStyle}`}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        {inputType == "password" && (
          <span onClick={() => setShow(!show)} className="pr-2 cursor-pointer">
            {!show ? <Eye stroke="#A1A1A9" /> : <EyeOff stroke="#A1A1A9" />}
          </span>
        )}
      </div>

      {errors && <Err message={errors.message || ""} />}
    </div>
  );
};
interface Props {
  label: string;
  children?: React.ReactNode;
  errors?: FieldError;
  inputType: "text" | "password" | "email";
  inputStyle?: string;
  labelStyle?: string;
  placeholder?: string;
  className?: string;
  value: string;
  setValue: (val: string) => void;
}

export default FormInputs;

export const Err = ({message}: {message: string}) => {
  return (
    <motion.p
      key={message}
      initial={{opacity: 0, scale: 0}}
      animate={{opacity: 1, scale: 1}}
      className="italic text-red-400"
    >
      {message}
    </motion.p>
  );
};
