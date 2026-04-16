import React from "react";
import {useForm} from "@mcc/utils";

export default function OTPVerify({verify}: {verify: (b: boolean) => void}) {
  const {register, handleSubmit, watch, setValue} = useForm<OTP>();

  const fields: (keyof OTP)[] = ["d1", "d2", "d3", "d4"];

  const onSubmit = (data: OTP) => {
    const code = `${data.d1}${data.d2}${data.d3}${data.d4}`;
    console.log("OTP Code:", code);
    verify(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof OTP,
  ) => {
    const value = e.target.value;

    // ✅ allow only digits
    if (!/^\d*$/.test(value)) return;

    const digit = value.slice(-1);
    setValue(field, digit);

    // ✅ move to next input
    if (digit && e.target.nextSibling) {
      (e.target.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // ✅ go back on backspace
    if (
      e.key === "Backspace" &&
      !(e.target as HTMLInputElement).value &&
      (e.target as HTMLInputElement).previousSibling
    ) {
      (
        (e.target as HTMLInputElement).previousSibling as HTMLInputElement
      ).focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text");

    if (!/^\d{4}$/.test(paste)) return;

    paste.split("").forEach((digit, index) => {
      setValue(fields[index], digit);
    });
  };

  const values = watch();
  const isComplete = values.d1 && values.d2 && values.d3 && values.d4;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mt-8 mb-6">
        <h4 className="text-xl font-semibold">
          Enter the 4 digit code we sent to
        </h4>
        <p className="text-muted text-xl">bright@gmail.com</p>
      </div>

      <div className="flex items-center gap-5 pb-4">
        {fields.map((field) => (
          <input
            key={field}
            type="text"
            maxLength={1}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            {...register(field, {required: true})}
            onChange={(e) => handleChange(e, field)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className="h-14 w-14 dark:bg-muted/20 text-black dark:text-white border-muted/50 border shadow-sm flex items-center justify-center mx-auto rounded-2xl py-2.5 font-medium text-center outline-primary/50 focus:outline transition-all duration-300"
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={!isComplete}
        className={`${
          isComplete
            ? "bg-primary text-white cursor-pointer"
            : "bg-muted/10 text-hint cursor-not-allowed"
        } shadow-sm flex items-center justify-center gap-2 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300`}
      >
        Continue
      </button>
    </form>
  );
}

interface OTP {
  d1: string;
  d2: string;
  d3: string;
  d4: string;
}
