"use client";

import { useEffect, useState } from "react";
import { extractApiError } from "@mcc/api";
import { User } from "@mcc/types";
import { useWhatsAppLogin } from "../hooks/useWhatsAppLogin";
import { toE164 } from "../services/phone";

const RESEND_SECONDS = 60;

const inputClass =
  "w-full dark:bg-muted/20 text-black dark:text-white border-muted/50 border shadow-sm rounded-2xl px-4 py-3 outline-primary/50 focus:outline transition-all duration-300";
const buttonClass =
  "bg-primary text-white shadow-sm flex items-center justify-center gap-2 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300 disabled:bg-muted/10 disabled:text-hint disabled:cursor-not-allowed cursor-pointer";

/** Log in with a one-time code sent to WhatsApp: number first, then the 6-digit code. */
export function WhatsAppLogin({
  onSuccess,
  emailLoginHref = "/login",
}: {
  onSuccess?: (user: User) => void;
  emailLoginHref?: string;
}) {
  const { requestMutation, verifyMutation } = useWhatsAppLogin();
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = (number: string) => {
    requestMutation.mutate(number, {
      onSuccess: () => {
        setPhone(number);
        setCode("");
        setCooldown(RESEND_SECONDS);
      },
    });
  };

  const onSubmitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const number = toE164(phoneInput);
    if (!number) {
      setLocalError("Enter a valid phone number, like 0801 234 5678.");
      return;
    }
    setLocalError(null);
    sendCode(number);
  };

  const onSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || code.length !== 6) return;
    verifyMutation.mutate({ phone, code }, { onSuccess: (data) => onSuccess?.(data.user) });
  };

  if (!phone) {
    return (
      <form onSubmit={onSubmitPhone} className="space-y-4">
        <div className="mt-8 mb-6">
          <h4 className="text-xl font-semibold">Log in with WhatsApp</h4>
          <p className="text-muted text-sm">We&apos;ll send a 6-digit code to your WhatsApp number.</p>
        </div>
        <label className="block text-sm font-medium">
          WhatsApp number
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0801 234 5678"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            className={`${inputClass} mt-1.5`}
          />
        </label>
        {(localError || requestMutation.isError) && (
          <p role="alert" className="text-red-500 text-sm text-center">
            {localError ?? extractApiError(requestMutation.error, "We couldn't send the code. Check the number and try again.")}
          </p>
        )}
        <button type="submit" disabled={!phoneInput.trim() || requestMutation.isPending} className={buttonClass}>
          {requestMutation.isPending ? "Sending..." : "Send code"}
        </button>
        <p className="text-sm text-center dark:text-muted">
          <a href={emailLoginHref} className="underline hover:text-primary transition-all duration-300">
            Use email and password instead
          </a>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmitCode} className="space-y-4">
      <div className="mt-8 mb-6">
        <h4 className="text-xl font-semibold">Enter the 6-digit code</h4>
        <p className="text-muted text-sm">Sent on WhatsApp to {phone}</p>
      </div>
      <input
        aria-label="6-digit code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
      />
      {verifyMutation.isError && (
        <p role="alert" className="text-red-500 text-sm text-center">
          {extractApiError(verifyMutation.error, "That code is wrong or has expired.")}
        </p>
      )}
      {requestMutation.isError && (
        <p role="alert" className="text-red-500 text-sm text-center">
          {extractApiError(requestMutation.error, "We couldn't send a new code.")}
        </p>
      )}
      <button type="submit" disabled={code.length !== 6 || verifyMutation.isPending} className={buttonClass}>
        {verifyMutation.isPending ? "Verifying..." : "Log in"}
      </button>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => {
            setPhone(null);
            verifyMutation.reset();
            requestMutation.reset();
          }}
          className="text-muted hover:text-primary cursor-pointer"
        >
          Change number
        </button>
        <button
          type="button"
          onClick={() => sendCode(phone)}
          disabled={cooldown > 0 || requestMutation.isPending}
          className={`font-medium ${cooldown > 0 || requestMutation.isPending ? "text-hint cursor-not-allowed" : "text-primary cursor-pointer hover:underline"}`}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}
