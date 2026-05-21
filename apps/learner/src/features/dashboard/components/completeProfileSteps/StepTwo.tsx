"use client";

import {FormInputs, useFormContext} from "@mcc/features";

import type {FormValues} from "../CompleteProfileForm";

export default function StepTwo() {
  const {
    register,

    formState: {errors},
  } = useFormContext<FormValues>();

  return (
    <>
      <FormInputs
        label="Your Country"
        placeholder="Country"
        registration={register("country", {
          required: "Country is required",
        })}
        errors={errors.country}
      />

      <FormInputs
        label="Your State"
        placeholder="State"
        registration={register("state", {
          required: "State is required",
        })}
        errors={errors.state}
      />

      <FormInputs
        label="Your City"
        placeholder="City"
        registration={register("city", {
          required: "City is required",
        })}
        errors={errors.city}
      />

      <FormInputs
        label="Your Street"
        placeholder="Street"
        registration={register("street", {
          required: "Street is required",
        })}
        errors={errors.street}
      />
    </>
  );
}
