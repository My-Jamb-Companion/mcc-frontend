"use client";

import { FieldError, FormInputs, useForm, usePasswordReset } from "@mcc/features";
import { extractApiError } from "@mcc/api";
import {motion} from "@mcc/ui";
import { useRouter } from "next/navigation";

interface Props {
  verificationToken: string;
}

export default function NewPassword({verificationToken}: Props) {
  const {register, formState, handleSubmit, watch} = useForm<NewPasswordInputs>();
  const errors = formState.errors;
  const { confirmMutation } = usePasswordReset();
  const router = useRouter();

  const onSubmit = (data: NewPasswordInputs) => {
    confirmMutation.mutate(
      { verificationToken, newPassword: data.password },
      { onSuccess: () => router.push("/login") }
    );
  };

  const password = watch("password");
  return (
    <div>
      <motion.div>
        <div className="mt-8 mb-6">
          <h4 className="text-xl font-semibold">Create New Password</h4>
          <p className="text-muted text-sm">
            Your new password must be at least 6 characters
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInputs
            label="New password"
            type="password"
            placeholder="Enter your new password"
            registration={register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            errors={errors.password as FieldError}
            isPassword
          />
          <FormInputs
            label="Confirm new password"
            type="password"
            placeholder="Confirm your new password"
            registration={register("confirmPassword", {
              required: "Please confirm your password",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            errors={errors.confirmPassword as FieldError}
            isPassword
          />

          {confirmMutation.isError && (
            <p className="text-red-500 text-sm text-center">
              {extractApiError(confirmMutation.error, "Failed to reset password")}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={confirmMutation.isPending}
            layoutId="auth-button"
            className="bg-primary text-white border-muted/50 border shadow-sm dark:shadow-primary flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {confirmMutation.isPending ? "Resetting..." : "Create password"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

interface NewPasswordInputs {
  password: string;
  confirmPassword: string;
}
