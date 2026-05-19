"use client";

import {FormInputs} from "@mcc/features";
import {Icon} from "@mcc/ui";

export default function CompleteProfileForm() {
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

      <form action="" className="pt-5 flex flex-col gap-5">
        <FormInputs
          label="What is your full name?"
          placeholder="Your full name"
        />
        <FormInputs
          label="Your Email Address"
          placeholder="Your email address"
        />
        <FormInputs label="Your Phone Number" placeholder="Your phone number" />
        <FormInputs
          type="select"
          label="Your Gender"
          placeholder="Select gender"
          options={[
            {value: "male", label: "Male"},
            {value: "female", label: "Female"},
            {value: "prefer not to say", label: "Prefer not to say"},
          ]}
        />

        <div className="flex items-center gap-4 pt-5">
          <button className="px-3.5 py-2.5 rounded-full text-sm font-medium cursor-pointer border border-muted/40 w-[30%]">
            Cancel
          </button>
          <button className="px-3.5 py-2.5 rounded-full text-sm font-medium cursor-pointer bg-btn-primary text-white w-full">
            Confirm
          </button>
        </div>
      </form>
    </section>
  );
}
