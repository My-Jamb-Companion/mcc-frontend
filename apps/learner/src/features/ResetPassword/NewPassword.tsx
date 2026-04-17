import FormInputs from "@mcc/features/auth/components/FormInputs";
import {motion} from "@mcc/ui";
import {FieldError, useForm} from "@mcc/utils";

export default function NewPassword() {
  const {register, formState, handleSubmit, watch} = useForm<Newpassword>();
  const errors = formState.errors;

  const onSubmit = (_data: Newpassword) => {};

  const password = watch("password");
  return (
    <div>
      <motion.div>
        <div className="mt-8 mb-6">
          <h4 className="text-xl font-semibold">Create New Password</h4>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInputs
            label="Create new password"
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

          <motion.button
            layoutId="auth-button"
            className="bg-primary text-white border-muted/50 border shadow-sm dark:shadow-primary flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300"
          >
            Create password
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

interface Newpassword {
  password: string;
  confirmPassword: string;
}
