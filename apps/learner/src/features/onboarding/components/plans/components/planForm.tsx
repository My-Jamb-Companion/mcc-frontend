"use client";
import FormInputs from "@/src/features/components/Forminputs";
import {planFormValues} from "../types/planForm";
import {useRouter} from "next/navigation";
import {useForm, Controller} from "@mcc/features";

export default function PlanForm({plan}: {plan?: "free" | "paid"}) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: {isValid},
  } = useForm<planFormValues>({
    mode: "onChange",
  });

  const isParent = watch("isParent");

  const router = useRouter();

  const submit = (data: planFormValues) => {
  if(data) router.push('dashboard')
  };
  return (
    <>
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4.5">
        <FormInputs
          label="Enter your email"
          placeholder="example@mail.com"
          registration={register("email", {required: "Please enter email"})}
        />

        <Controller
          key="isParent"
          name="isParent"
          control={control}
          render={({field: {onChange, value}}) => (
            <FormInputs
              type="checkbox"
              label="I am a parent/guardian"
              value={value}
              onChange={onChange}
            />
          )}
        />

        {isParent && (
          <FormInputs
            label="Your child/ward's name"
            placeholder="emmmauel winner"
            registration={register("childName", {
              required: "Please enter your child/ward's name",
            })}
          />
        )}

        {plan !== "free" && (
          <Controller
            key="paymentMethod"
            name="paymentMethod"
            control={control}
            rules={{required: "Please select a payment method"}}
            render={({field: {onChange, value}}) => (
              <FormInputs
                key="paymentMethod"
                label={"Please select a payment method"}
                type="select"
                options={[
                  {label: "Stripe", value: "stripe"},
                  {label: "PayPal", value: "paypal"},
                ]}
                value={value}
                onChange={onChange}
              />
            )}
          />
        )}

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="max-sm:hidden text-black dark:text-white border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-hint/40 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300"
          >
            Back
          </button>

          <button
            type="submit"
            onClick={isValid ? () => router.push("/dashboard") : undefined}
            disabled={!isValid}
            className={`${isValid ? "bg-primary text-white hover:bg-primary/90 cursor-pointer" : "bg-hint/30 text-hint dark:bg-muted/30 dark:text-muted cursor-not-allowed"} shadow-sm flex items-center justify-center gap-2 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300`}
          >
            {plan === "free" ? "Access course" : "Proceed to payment"}
          </button>
        </div>
      </form>
    </>
  );
}
