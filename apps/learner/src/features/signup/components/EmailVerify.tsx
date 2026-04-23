"use client";

import {Icon} from "@mcc/ui";
import { useSignup } from "@mcc/features";
import { extractApiError } from "@mcc/api";

export default function EmailVerify({email}: {email: string}) {
  const { resendMutation } = useSignup();

  return (
    <div className="space-y-4">
      <div className="dark:bg-muted bg-hint/40 p-6 rounded-full w-fit mx-auto mt-5">
        <Icon name="hugeicons:mail-open" size={48} />
      </div>
      <h2 className="text-xl font-bold mt-4">Verify Your Email</h2>
      <p className="text-muted text-sm">
        We sent you a verification email to{" "}
        <span className="text-black font-medium dark:text-white">{email}.</span>{" "}
        Please tap the link inside that email to continue.
      </p>

      {resendMutation.isError && (
        <p className="text-sm text-center text-red-500">
          {extractApiError(resendMutation.error, "Could not resend verification email")}
        </p>
      )}
      {resendMutation.isSuccess && (
        <p className="text-sm text-center text-primary">
          Verification link resent successfully.
        </p>
      )}

      <p className="text-muted text-sm font-medium">
        Having trouble?{" "}
        <span
          onClick={() => resendMutation.mutate(email)}
          className="text-black font-medium dark:text-white cursor-pointer hover:text-primary transition-all duration-300"
        >
          {resendMutation.isPending ? "Resending..." : "Resend verification email."}
        </span>
      </p>

      <div className="space-y-4 mt-4">
        <button className="bg-btn-primary text-white hover:bg-primary/90 shadow-sm flex items-center justify-center gap-2 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300">
          Open email app
        </button>
        <a
          href="/login"
          className="bg-none border border-muted hover:bg-muted/10 shadow-sm flex items-center justify-center gap-2 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300"
        >
          Back to login
        </a>
      </div>
    </div>
  );
}
