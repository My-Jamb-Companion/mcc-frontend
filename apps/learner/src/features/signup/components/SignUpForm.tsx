import {FieldErrors, useForm} from "react-hook-form";
import FormInputs from "./formInputs";
import Link from "next/link";
import {Icon} from "@mcc/ui";

export default function SignupForm({back}: {back: (value: boolean) => void}) {
  const {register, formState, handleSubmit} = useForm<SignUpFormInputs>();
  const errors = formState.errors;
  const onSubmit = (data: SignUpFormInputs) => {
    console.log(data);
  };
  console.log(formState.errors);
  return (
    <div className="">
      <div className="mt-8 mb-6">
        <h4 className="text-xl font-semibold">Create an account</h4>
        <p className="text-muted text-sm">Sign up and study better</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInputs
          label="Email"
          type="email"
          placeholder="Enter your email address"
          registration={register("email", {required: "Email is required"})}
          errors={errors.email as FieldError}
        />
        <FormInputs
          label="Password"
          type="password"
          placeholder="Enter your password"
          registration={register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          errors={errors.password as FieldError}
          isPassword
        />
        <button className="bg-primary text-white border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300">
          Create Account
        </button>
        <p
          className="text-sm text-black flex items-center justify-center gap-2 cursor-pointer hover:text-primary transition-all duration-300 w-fit"
          onClick={back.bind(null, false)}
        >
          <Icon icon="ph:arrow-left" width={16} />
          Back
        </p>
      </form>

      <p className="text-sm text-center font-medium flex items-center justify-center gap-2 cursor-pointer text-muted mt-4">
        Already have an account?
        <Link href="/login">
          <span className="underline cursor-pointer text-black hover:text-primary transition-all duration-300">
            Sign in
          </span>
        </Link>
      </p>
    </div>
  );
}

interface SignUpFormInputs {
  Name: string;
  Email: string;
  Password: string;
  ConfirmPassword: string;
  error: FieldErrors | undefined;
  // errors: FieldErrors | undefined
}
