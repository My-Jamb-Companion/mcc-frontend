"use client";

import {FormInputs} from "@mcc/features";
import {Button, Icon, motion, AnimatePresence, Variants} from "@mcc/ui";
import {useForm} from "react-hook-form";

type PaymentFormValues = {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

export default function PaymentDetails({price}: {price: number}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<PaymentFormValues>({
    defaultValues: {
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const cardName = watch("cardName");
  const cardNumber = watch("cardNumber");
  const watched = watch();

  const cardNumberValid = watched.cardNumber?.replace(/\D/g, "").length === 16;

  const expiryValid = /^(0[1-9]|1[0-2])\/\d{4}$/.test(watched.expiryDate || "");

  const cvvValid = /^\d{3,4}$/.test(watched.cvv || "");

  const cardNameValid = watched.cardName?.trim().length >= 3;

  const isFormComplete =
    cardNameValid && cardNumberValid && expiryValid && cvvValid;

  const onSubmit = (data: PaymentFormValues) => {
    console.log(data);
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full bg-background p-5 flex flex-col gap-5 overflow-hidden"
    >
      <motion.div variants={item} className="flex flex-col gap-1">
        <motion.p
          initial={{opacity: 0, x: -10}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.1}}
          className="text-2xl font-semibold"
        >
          Payment Details
        </motion.p>
      </motion.div>

      <motion.div
        variants={item}
        whileHover={{
          y: -3,
          scale: 1.01,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
        }}
        className="relative overflow-hidden rounded-2xl bg-black text-white p-5 h-48 flex flex-col justify-between"
      >
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
          }}
          className="absolute -top-10 -right-10 size-32 rounded-full bg-white/10 blur-2xl"
        />

        <div className="flex items-center justify-between relative z-10">
          <p className="text-sm text-white/70">Credit Card</p>

          <Icon icon="solar:card-outline" size={28} />
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          <motion.p
            key={cardNumber}
            initial={{opacity: 0, y: 5}}
            animate={{opacity: 1, y: 0}}
            className="tracking-[0.3em] text-lg font-medium"
          >
            {cardNumber || "•••• •••• •••• ••••"}
          </motion.p>

          <div className="flex items-center justify-between">
            <motion.p
              key={cardName}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              className="uppercase text-sm text-white/80"
            >
              {cardName || "CARD HOLDER"}
            </motion.p>

            <p className="text-sm text-white/60">VISA</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <FormInputs
          label="Card owners name"
          placeholder="Name of Credit/debit Card"
          registration={register("cardName", {
            required: "Card owner name is required",
          })}
          errors={errors.cardName}
        />
      </motion.div>

      <motion.div variants={item} className="relative">
        <FormInputs
          type="tel"
          label="Credit Card number"
          placeholder="xxxx xxxx xxxx xxxx"
          inputProps={{maxLength: 16}}
          registration={register("cardNumber", {
            required: "Card number is required",
            pattern: {
              value: /^\d{16}$/,
              message: "Card number must be 16 digits",
            },
          })}
          errors={errors.cardNumber}
        />

        <motion.div
          animate={{
            rotate: cardNumber ? [0, -6, 6, 0] : 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="absolute right-3 top-9.5 text-muted"
        >
          <Icon icon="solar:card-outline" size={18} />
        </motion.div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 gap-4">
        <div>
          <FormInputs
            label="Expiry Date"
            placeholder="MM / YYYY"
            inputProps={{maxLength: 4}}
            registration={register("expiryDate", {
              required: "Expiry date is required",
              pattern: {
                value: /^\d{4}$/,
                message: "Please enter a valid expiry date (MM / YYYY)",
              },
            })}
            errors={errors.expiryDate}
          />
        </div>

        <div className="relative">
          <FormInputs
            type="tel"
            label="CVV"
            placeholder="123"
            inputProps={{maxLength: 3}}
            registration={register("cvv", {
              required: "CVV is required",
              pattern: {
                value: /^\d{3}$/,
                message: "CVV must be 3 digits",
              },
            })}
            errors={errors.cvv}
          />

          <motion.div
            whileHover={{
              scale: 1.1,
            }}
            className="absolute right-3 top-9.5 text-muted"
          >
            <Icon icon="mdi:credit-card-lock-outline" size={18} />
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-3 pt-1">
        <motion.div
          whileHover={{x: 2}}
          className="flex items-center justify-between text-sm"
        >
          <p className="text-subtle">Subtotal</p>

          <p className="font-medium">$75.95</p>
        </motion.div>

        <motion.div
          whileHover={{x: 2}}
          className="flex items-center justify-between text-sm"
        >
          <p className="text-subtle">VAT</p>

          <p className="font-medium">$525.05</p>
        </motion.div>

        <motion.div
          layout
          className="border-t border-muted/20 pt-4 flex items-center justify-between"
        >
          <p className="text-subtle">Total Amount</p>

          <motion.p
            key={price}
            initial={{scale: 0.9, opacity: 0.5}}
            animate={{scale: 1, opacity: 1}}
            className="text-2xl font-semibold"
          >
            ${price.toFixed(2)}
          </motion.p>
        </motion.div>
      </motion.div>

      <motion.div
        variants={item}
        whileHover={{
          scale: 1.01,
        }}
        whileTap={{
          scale: 0.98,
        }}
      >
        <Button
          type="submit"
          variant={isFormComplete ? "primary" : "secondary"}
          className="mt-2 overflow-hidden relative"
        >
          <motion.div
            initial={{x: "-100%"}}
            whileHover={{x: "100%"}}
            transition={{
              duration: 0.8,
            }}
            className="absolute inset-0 bg-white/10 skew-x-12"
          />

          <div className="flex items-center justify-center gap-2 relative z-10">
            <span>Pay now</span>

            <motion.div
              animate={{
                x: [0, 4, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
              }}
            >
              <Icon icon="basil:arrow-right-outline" size={16} />
            </motion.div>
          </div>
        </Button>
      </motion.div>

      <AnimatePresence>
        {(errors.cardName ||
          errors.cardNumber ||
          errors.expiryDate ||
          errors.cvv) && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 10,
            }}
            className="text-danger text-sm text-center"
          >
            Please complete all payment fields
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
