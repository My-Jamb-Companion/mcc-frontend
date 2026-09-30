"use client";

import { useForm, usePasswordReset } from "@mcc/features";
import React, { useState, useEffect } from "react";
import { extractApiError } from "@mcc/api";

interface Props {
  email: string;
  onVerified: (verificationToken: string) => void;
}

export default function OTPVerify({email, onVerified}: Props) {
  const {register, handleSubmit, watch, setValue} = useForm<OTP>();
  const { verifyMutation, resendMutation } = usePasswordReset();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = () => {
    resendMutation.mutate(email, {
      onSuccess: () => setCooldown(60),
    });
  };

  const fields: (keyof OTP)[] = ["d1", "d2", "d3", "d4"];

  const onSubmit = (data: OTP) => {
    const code = `${data.d1}${data.d2}${data.d3}${data.d4}`;
    verifyMutation.mutate(
      { email, code },
      { onSuccess: (token) => onVerified(token) }
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof OTP,
  ) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    setValue(field, digit);
    if (digit && e.target.nextSibling) {
      (e.target.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        <p className="text-muted text-xl">{email}</p>
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

      {verifyMutation.isError && (
        <p className="text-red-500 text-sm text-center mb-3">
          {extractApiError(verifyMutation.error, "Invalid or expired code")}
        </p>
      )}

      {resendMutation.isError && (
        <p className="text-red-500 text-sm text-center mb-3">
          {extractApiError(resendMutation.error, "Failed to resend code")}
        </p>
      )}

      {resendMutation.isSuccess && (
        <p className="text-green-500 text-sm text-center mb-3">
          Code resent successfully
        </p>
      )}

      <button
        type="submit"
        disabled={!isComplete || verifyMutation.isPending}
        className={`${
          isComplete && !verifyMutation.isPending
            ? "bg-primary text-white cursor-pointer"
            : "bg-muted/10 text-hint cursor-not-allowed"
        } shadow-sm flex items-center justify-center gap-2 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300`}
      >
        {verifyMutation.isPending ? "Verifying..." : "Continue"}
      </button>

      <div className="text-center mt-4 text-sm">
        <span className="text-muted">Didn&apos;t receive a code? </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resendMutation.isPending}
          className={`font-medium ${
            cooldown > 0 || resendMutation.isPending
              ? "text-hint cursor-not-allowed"
              : "text-primary cursor-pointer hover:underline"
          }`}
        >
          {resendMutation.isPending
            ? "Sending..."
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend code"}
        </button>
      </div>
    </form>
  );
}

interface OTP {
  d1: string;
  d2: string;
  d3: string;
  d4: string;
}
