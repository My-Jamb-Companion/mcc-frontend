import OTPVerify from "./OTPVerify";
import {useState} from "react";
import NewPassword from "./NewPassword";
import {FormInputs, useForm, usePasswordReset} from "@mcc/features";
import {extractApiError} from "@mcc/api";

export default function ForgetPassword() {
  const {register, formState, handleSubmit, getValues} = useForm<Reset>();
  const errors = formState.errors;
  const {requestMutation} = usePasswordReset();

  const [step, setStep] = useState<"email" | "otp" | "newPassword">("email");
  const [verificationToken, setVerificationToken] = useState("");

  const onSubmit = (data: Reset) => {
    requestMutation.mutate(data.email, {
      onSuccess: () => setStep("otp"),
    });
  };

  const handleVerified = (token: string) => {
    setVerificationToken(token);
    setStep("newPassword");
  };

  return (
    <>
      {step === "otp" ? (
        <OTPVerify email={getValues("email")} onVerified={handleVerified} />
      ) : step === "newPassword" ? (
        <NewPassword verificationToken={verificationToken} />
      ) : (
        <>
          <div className="mt-8 mb-6">
            <h4 className="text-xl font-semibold">Reset Password</h4>
            <p className="text-muted text-sm">
              Enter your email to receive a reset code
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInputs
              label="Email"
              type="email"
              placeholder="Enter your email address"
              registration={register("email", {required: "Email is required"})}
              errors={errors.email}
            />

            {requestMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                {extractApiError(
                  requestMutation.error,
                  "Failed to send reset code",
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={requestMutation.isPending}
              className="bg-primary text-white border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {requestMutation.isPending ? "Sending..." : "Send Code"}
            </button>
          </form>
        </>
      )}
    </>
  );
}

interface Reset {
  email: string;
}
