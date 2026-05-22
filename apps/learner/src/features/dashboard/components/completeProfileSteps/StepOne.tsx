"use client";

import {Controller, FormInputs, useFormContext} from "@mcc/features";
import {ProfileModalFormValues} from "@mcc/store";

export default function StepOne() {
  const {
    register,
    control,
    formState: {errors},
  } = useFormContext<ProfileModalFormValues>();

  return (
    <>
      <FormInputs
        label="What is your full name?"
        placeholder="Your full name"
        registration={register("fullName", {
          required: "Full name is required",
        })}
        errors={errors.fullName}
      />

      <FormInputs
        label="Your Email Address"
        placeholder="Your email address"
        registration={register("email", {
          required: "Email is required",
        })}
        errors={errors.email}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Your Phone Number</label>

        <Controller
          name="phone"
          control={control}
          rules={{
            required: "Phone number is required",

            validate: (value) =>
              value.number.length >= 8 || "Invalid phone number",
          }}
          render={({field}) => {
            return (
              <div
                className={
                  "flex items-center gap-2 w-full border border-muted/20 rounded-md text-sm text-muted " +
                  (errors.phone?.message ? " border-danger!" : "")
                }
              >
                <select
                  value={field.value.code}
                  onChange={(e) =>
                    field.onChange({
                      ...field.value,
                      code: e.target.value,
                    })
                  }
                  className="px-2 py-3 outline-none bg-transparent"
                >
                  {[
                    {value: "+234", label: "NG"},
                    {value: "+1", label: "US"},
                    {value: "+44", label: "GB"},
                  ].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <input
                  value={field.value.number}
                  onChange={(e) =>
                    field.onChange({
                      ...field.value,
                      number: e.target.value,
                    })
                  }
                  placeholder="81 234 4556 45"
                  className={"w-full px-3 py-3 outline-none bg-transparent"}
                />
              </div>
            );
          }}
        />

        {errors.phone?.message && (
          <p className="text-danger text-xs">{errors.phone.message}</p>
        )}
      </div>

      <Controller
        name="gender"
        control={control}
        rules={{
          required: "Gender is required",
        }}
        render={({field}) => (
          <FormInputs
            type="select"
            label="Your Gender"
            placeholder="Select gender"
            options={[
              {
                value: "male",
                label: "Male",
              },

              {
                value: "female",
                label: "Female",
              },

              {
                value: "prefer not to say",
                label: "Prefer not to say",
              },
            ]}
            value={field.value}
            onChange={field.onChange}
            errors={errors.gender}
          />
        )}
      />
    </>
  );
}
