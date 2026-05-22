"use client";

import {FormInputs, useFormContext} from "@mcc/features";
import {ProfileModalFormValues} from "@mcc/store";

export default function StepTwo() {
  const {
    register,

    formState: {errors},
  } = useFormContext<ProfileModalFormValues>();

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
