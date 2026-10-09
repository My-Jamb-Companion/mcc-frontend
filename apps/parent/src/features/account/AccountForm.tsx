"use client";

import { useEffect } from "react";
import { FormInputs, useForm } from "@mcc/features";
import { Button } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { useProfile, useUpdateProfile } from "./useAccount";

interface FormValues {
  full_name: string;
  phone_number: string;
}

export const AccountForm = () => {
  const { data: profile, isLoading, isError } = useProfile();
  const update = useUpdateProfile();
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: { full_name: "", phone_number: "" },
  });

  useEffect(() => {
    if (profile) reset({ full_name: profile.full_name ?? "", phone_number: profile.phone_number ?? "" });
  }, [profile, reset]);

  if (isLoading) return <p className="text-sm text-muted">Loading your details…</p>;
  if (isError || !profile) return <p className="text-sm text-danger">Couldn&apos;t load your details.</p>;

  const onSubmit = (data: FormValues) => {
    update.mutate({ full_name: data.full_name.trim(), phone_number: data.phone_number.trim() });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Email</p>
        <p className="text-sm">{profile.email}</p>
      </div>
      <FormInputs
        label="Full name"
        registration={register("full_name", { required: "Required" })}
        errors={formState.errors.full_name}
      />
      <FormInputs
        label="Phone number"
        type="tel"
        placeholder="+2348012345678"
        registration={register("phone_number")}
        errors={formState.errors.phone_number}
      />

      {update.isError && (
        <p role="alert" className="text-sm text-red-500">
          {extractApiError(update.error, "We couldn't save your details.")}
        </p>
      )}
      {update.isSuccess && !formState.isDirty && <p className="text-sm text-green-600">Saved.</p>}

      <Button type="submit" width="fit" loading={update.isPending} disabled={!formState.isDirty}>
        Save changes
      </Button>
    </form>
  );
};
