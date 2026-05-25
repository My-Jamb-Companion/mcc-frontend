"use client";

import {FormInputs, useFormContext} from "@mcc/features";
import {ProfileModalFormValues} from "@mcc/store";
import {motion} from "@mcc/ui";

export default function StepTwo() {
  const {
    register,

    formState: {errors},
  } = useFormContext<ProfileModalFormValues>();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5"
    >
      <motion.div variants={item}>
        <FormInputs
          label="Your Country"
          placeholder="Country"
          registration={register("country", {
            required: "Country is required",
          })}
          errors={errors.country}
        />
      </motion.div>

      <motion.div variants={item}>
        <FormInputs
          label="Your State"
          placeholder="State"
          registration={register("state", {
            required: "State is required",
          })}
          errors={errors.state}
        />
      </motion.div>

      <motion.div variants={item}>
        <FormInputs
          label="Your City"
          placeholder="City"
          registration={register("city", {
            required: "City is required",
          })}
          errors={errors.city}
        />
      </motion.div>

      <motion.div variants={item}>
        <FormInputs
          label="Your Street"
          placeholder="Street"
          registration={register("street", {
            required: "Street is required",
          })}
          errors={errors.street}
        />
      </motion.div>
    </motion.div>
  );
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};
