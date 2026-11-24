"use client";

import FormInputs from "./FormInputs";
// import Link from "next/link";
import {motion, Icon, TurnstileWidget} from "@mcc/ui";
import EmailVerify from "./EmailVerify";
import {useState} from "react";
import {useForm, useSignup} from "@mcc/features";
import {extractApiError} from "@mcc/api";

export default function SignupForm({back}: {back: (value: boolean) => void}) {
  const {register, formState, getValues, handleSubmit} =
    useForm<SignUpFormInputs>();
  const [emailVerify, setEmailVerify] = useState(false);
  const errors = formState.errors;
  const {signupMutation} = useSignup();
  // The "are you a person?" check. Without a site key (not set up yet) the form works as before.
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);

  const onSubmit = (data: SignUpFormInputs) => {
    signupMutation.mutate(
      {email: data.email, password: data.password, captchaToken},
      {
        onSuccess: () => setEmailVerify(true),
        // A token works once, so after a failed attempt the check runs again.
        onError: () => setCaptchaReset((n) => n + 1),
      },
    );
  };

  // const password = watch("password");
  return (
    <>
      {emailVerify ? (
        <EmailVerify email={getValues("email") || ""} />
      ) : (
        <motion.div
          key="signup-form"
          layout
          initial={{opacity: 0, scale: 0.96}}
          animate={{opacity: 1, scale: 1}}
          exit={{opacity: 0, scale: 0.96}}
          transition={{duration: 0.35, ease: "easeInOut"}}
        >
          <motion.div layoutId="auth-card">
            <div className="mt-8 mb-6">
              <h4 className="text-xl font-semibold">Create an account</h4>
              <p className="text-muted text-sm">Sign up and study better</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormInputs
                label="Email"
                type="email"
                placeholder="Enter your email address"
                registration={register("email", {
                  required: "Email is required",
                })}
                errors={errors.email}
              />
              <FormInputs
                label="Password"
                type="password"
                placeholder="Enter your password"
                registration={register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                errors={errors.password}
                isPassword
              />
              {/* <FormInputs
                label="Confirm Password"
                type="password"
                placeholder="Confirm Password"
                registration={register("confirmPassword", {
                  required: "Please confirm your password",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                errors={errors.confirmPassword}
                isPassword
              /> */}

              <TurnstileWidget siteKey={siteKey} onToken={setCaptchaToken} resetSignal={captchaReset} />

              {signupMutation.isError && (
                <p className="text-red-500 text-sm text-center">
                  {extractApiError(
                    signupMutation.error,
                    "Failed to create account",
                  )}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={signupMutation.isPending || (!!siteKey && !captchaToken)}
                layoutId="auth-button"
                className="bg-primary text-white border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {signupMutation.isPending ? "Processing..." : "Continue"}
              </motion.button>

              <p
                className="text-sm text-black dark:text-muted flex items-center justify-center gap-2 cursor-pointer hover:text-primary transition-all duration-300 w-fit"
                onClick={back.bind(null, false)}
              >
                <Icon icon="eva:arrow-back-outline" size={24} />
                <span>Back</span>
              </p>
            </form>

            {/* <p className="text-sm text-center font-medium flex items-center justify-center gap-2 cursor-pointer text-muted mt-4">
              Already have an account?
              <Link href="/login">
                <span className="underline cursor-pointer text-black dark:text-white hover:text-primary transition-all duration-300">
                  Sign in
                </span>
              </Link>
            </p> */}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

interface SignUpFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
}
