import {FieldErrors, useForm} from "@mcc/utils";
import FormInputs from "./FormInputs";
import Link from "next/link";
import {motion} from "@mcc/ui";
import EmailVerify from "./EmailVerify";
import {useState} from "react";

export default function SignupForm({back}: {back: (value: boolean) => void}) {
  const {register, formState, watch, handleSubmit} =
    useForm<SignUpFormInputs>();
  const [emailVerify, setEmailVerify] = useState(false);
  const errors = formState.errors;
  const onSubmit = (data: SignUpFormInputs) => {
    console.log(data);
    setEmailVerify(true);
  };
  const password = watch("password");
  return (
    <>
      {emailVerify ? (
        <EmailVerify email={formState.values.email || ""} />
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
              <FormInputs
                label="Confirm Password"
                type="password"
                placeholder="Confirm Password"
                registration={register("confirmPassword", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                errors={errors.confirmPassword}
                isPassword
              />

              <motion.button
                layoutId="auth-button"
                className="bg-primary text-white border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300"
              >
                Create Account
              </motion.button>

              <p
                className="text-sm text-black dark:text-muted flex items-center justify-center gap-2 cursor-pointer hover:text-primary transition-all duration-300 w-fit"
                onClick={back.bind(null, false)}
              >
                Back
              </p>
            </form>

            <p className="text-sm text-center font-medium flex items-center justify-center gap-2 cursor-pointer text-muted mt-4">
              Already have an account?
              <Link href="/login">
                <span className="underline cursor-pointer text-black dark:text-white hover:text-primary transition-all duration-300">
                  Sign in
                </span>
              </Link>
            </p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

interface SignUpFormInputs {
  Name: string;
  Email: string;
  Password: string;
  ConfirmPassword: string;
  error: FieldErrors | undefined;
}
