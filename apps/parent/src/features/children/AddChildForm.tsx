"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, FormInputs, useForm } from "@mcc/features";
import { Button, LegalLink } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { useAddChild } from "./useChildren";
import { AddChildInput } from "./children.service";

const RELATIONSHIPS = [
  { label: "Parent", value: "parent" },
  { label: "Guardian", value: "guardian" },
  { label: "Other", value: "other" },
];

export const AddChildForm = () => {
  const router = useRouter();
  const addChild = useAddChild();
  const { register, control, handleSubmit, formState } = useForm<AddChildInput>({
    defaultValues: { relationship: "parent", guardian_consent: false },
  });

  const onSubmit = (data: AddChildInput) => {
    addChild.mutate(data, { onSuccess: (child) => router.push(`/children/${child.child_id}`) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <FormInputs
        label="Child's full name"
        registration={register("child_full_name")}
        errors={formState.errors.child_full_name}
      />
      <FormInputs
        label="Child's email"
        type="email"
        registration={register("child_email", { required: "Required" })}
        errors={formState.errors.child_email}
      />
      <FormInputs
        label="Set a password for your child"
        type="password"
        isPassword
        registration={register("child_password", {
          required: "Required",
          minLength: { value: 6, message: "At least 6 characters" },
        })}
        errors={formState.errors.child_password}
      />
      <FormInputs
        label="Child's date of birth"
        type="text"
        inputProps={{ type: "date", max: new Date().toISOString().slice(0, 10) }}
        registration={register("child_date_of_birth", { required: "Required" })}
        errors={formState.errors.child_date_of_birth}
      />
      <Controller
        name="relationship"
        control={control}
        render={({ field }) => (
          <FormInputs
            label="Relationship to child"
            type="select"
            options={RELATIONSHIPS}
            value={field.value}
            onChange={field.onChange}
            errors={formState.errors.relationship}
          />
        )}
      />

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1 accent-primary"
          {...register("guardian_consent", { validate: (v) => v === true || "You need to give your consent to continue" })}
        />
        <span>
          I am this child&apos;s parent or legal guardian. I consent to them using SmartLearnersHQ and to their
          information being used as described in the <LegalLink doc="privacy">Privacy Policy</LegalLink>.
        </span>
      </label>
      {formState.errors.guardian_consent && (
        <p role="alert" className="text-xs text-red-500">{formState.errors.guardian_consent.message}</p>
      )}

      <p className="text-xs text-muted">
        This creates a new account for your child, ready to use straight away. The email must not already be
        registered with SmartLearnersHQ.
      </p>

      {addChild.isError && (
        <p role="alert" className="text-sm text-red-500">
          {extractApiError(addChild.error, "We couldn't add your child. Please try again.")}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" width="fit" loading={addChild.isPending}>
          Add child
        </Button>
        <Link href="/children" className="text-sm text-muted hover:text-primary">
          Cancel
        </Link>
      </div>
    </form>
  );
};
