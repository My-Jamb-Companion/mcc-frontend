"use client";

import { useEffect } from "react";
import { FormInputs, useForm } from "@mcc/features";
import { Button } from "@mcc/ui";
import { useProfile, useUpdateProfile } from "./useAccount";

interface AccountFormInputs {
  full_name: string;
  phone_number: string;
  teaching_subject: string;
}

export const AccountForm = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { register, handleSubmit, reset, formState } = useForm<AccountFormInputs>();

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? "",
        phone_number: profile.phone_number ?? "",
        teaching_subject: profile.teaching_subject ?? "",
      });
    }
  }, [profile, reset]);

  if (isLoading) {
    return <p className="text-sm text-muted">Loading your profile…</p>;
  }

  return (
    <form
      onSubmit={handleSubmit((data) => updateProfile.mutate(data))}
      className="space-y-4 max-w-md"
    >
      <p className="text-sm text-muted">{profile?.email}</p>
      <FormInputs label="Full name" registration={register("full_name")} errors={formState.errors.full_name} />
      <FormInputs
        label="Phone number"
        registration={register("phone_number")}
        errors={formState.errors.phone_number}
      />
      <FormInputs
        label="Teaching subject"
        placeholder="e.g. Mathematics"
        registration={register("teaching_subject")}
        errors={formState.errors.teaching_subject}
      />
      <Button type="submit" loading={updateProfile.isPending}>
        Save changes
      </Button>
    </form>
  );
};
