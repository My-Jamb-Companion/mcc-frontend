"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, FormInputs, useForm } from "@mcc/features";
import { Button } from "@mcc/ui";
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
    defaultValues: { relationship: "parent" },
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

      <p className="text-xs text-muted">
        This creates a new account for your child, ready to use straight away. The email must not already be
        registered with My Course Companion.
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
