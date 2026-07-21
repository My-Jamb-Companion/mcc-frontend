import {FormInputs, useForm} from "@mcc/features";

interface UpdatePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UpdatePasswordFormProps {
  onSave?: (values: UpdatePasswordFormValues) => void;
}

export function UpdatePasswordForm({onSave}: UpdatePasswordFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<UpdatePasswordFormValues>({
    defaultValues: {currentPassword: "", newPassword: "", confirmPassword: ""},
  });

  const newPassword = watch("newPassword");
  const submit = handleSubmit((values) => onSave?.(values));

  return (
    <form className="max-w-2xl" onSubmit={submit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInputs
          label="Current password"
          placeholder="Enter current password"
          isPassword
          registration={register("currentPassword", {
            required: "Current password is required",
          })}
          errors={errors.currentPassword}
        />
        <FormInputs
          label="New Password"
          placeholder="Enter new password"
          isPassword
          registration={register("newPassword", {
            required: "New password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
          errors={errors.newPassword}
        />
      </div>

      <div className="mt-4">
        <FormInputs
          label="Confirm password"
          placeholder="Confirm new password"
          isPassword
          registration={register("confirmPassword", {
            required: "Please confirm your new password",
            validate: (value) =>
              value === newPassword || "Passwords do not match",
          })}
          errors={errors.confirmPassword}
        />
      </div>

      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-violet-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
      >
        Update Password
      </button>
    </form>
  );
}
