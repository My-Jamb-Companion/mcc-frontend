"use client";

import {Controller, FormInputs, useForm} from "@mcc/features";
import {Icon} from "@mcc/ui";
import {useState} from "react";

export default function CompleteProfileForm() {
  const [step, setStep] = useState(1);
  const {
    control,
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>({
    defaultValues: {gender: "", phone: {code: "NG", number: ""}},
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    console.log(errors);
  };

  return (
    <section className="">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">
          Complete all 3 sections of your profile
        </p>
        <div className="w-full rounded-full bg-muted/50 h-1">
          <div className="rounded-full bg-btn-primary w-[33%] h-1" />
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-5">
        <div className="p-3 rounded-xl border border-muted/40 w-fit">
          <Icon icon="ri:user-line" />
        </div>

        <div className="flex flex-col gap-4">
          <p className="font-semibold text-2xl">Complete your profile</p>
          <p className="text-subtle">
            We would like to learn more about you to help personalize your
            account.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="pt-5 flex flex-col gap-5"
      >
        <FormInputs
          label="What is your full name?"
          placeholder="Your full name"
          errors={errors.fullName}
          registration={register("fullName")}
        />
        <FormInputs
          label="Your Email Address"
          placeholder="Your email address"
          errors={errors.email}
          registration={register("email")}
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
                <div className="flex items-center gap-2 w-full border border-muted/20 rounded-md text-sm text-muted outline-none ">
                  <select
                    value={field.value.code}
                    onChange={(e) =>
                      field.onChange({...field.value, code: e.target.value})
                    }
                    className="px-2 py-2 text-sm outline-0"
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
                      field.onChange({...field.value, number: e.target.value})
                    }
                    placeholder="81 234 4556 45"
                    className="w-full px-3 py-2 text-sm outline-0"
                  />
                </div>
              );
            }}
          />
          {errors.phone && (
            <p className="text-danger text-xs mt-1">
              {errors.phone.number?.message ?? errors.phone.message}
            </p>
          )}
        </div>

        <Controller
          name={"gender"}
          control={control}
          rules={{required: "Gender is required"}}
          render={({field: {onChange, value}}) => (
            <FormInputs
              type="select"
              label="Your Gender"
              placeholder="Select gender"
              errors={errors.gender}
              options={[
                {value: "male", label: "Male"},
                {value: "female", label: "Female"},
                {value: "prefer not to say", label: "Prefer not to say"},
              ]}
              value={value}
              onChange={onChange}
            />
          )}
        />

        <div className="flex items-center gap-4 pt-5">
          <button
            type="button"
            className="px-3.5 py-2.5 rounded-full text-sm font-medium cursor-pointer border border-muted/40 w-[30%]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3.5 py-2.5 rounded-full text-sm font-medium cursor-pointer bg-btn-primary text-white w-full"
          >
            Confirm
          </button>
        </div>
      </form>
    </section>
  );
}
type FormValues = {
  fullName: string;
  email: string;
  phone: PhoneValue;
  gender: string;
};

type PhoneValue = {
  code: string;
  number: string;
};
