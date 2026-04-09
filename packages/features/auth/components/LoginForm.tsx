import {useAuth} from "../hooks/useAuth";
import FormInputs from "./FormInputs";
import {Icon} from "@iconify/react";
import Link from "next/link";
import {useForm, FieldError, FieldErrors} from "react-hook-form";
import {useState} from "react";
import LoggingIn from "./LoggingIn";

export const LoginForm = ({
  onSuccess,
}: {
  onSuccess?: (role: string) => void;
}) => {
  const {login} = useAuth();

  const {register, formState, handleSubmit} = useForm<LoginFormInputs>();
  const errors = formState.errors;
  const [loading, setLoading] = useState(false);

  const onSubmit = (data: SignUpFormInputs) => {
    console.log(data);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      handleLogin("learner");
    }, 4000);
  };

  const handleLogin = async (role: any) => {
    await login(role);
    onSuccess?.(role);
  };

  return (
    // <div className="space-y-3">
    //   <button onClick={() => handleLogin("learner")}>
    //     Login as Learner
    //   </button>
    //   <button onClick={() => handleLogin("instructor")}>
    //     Login as Instructor
    //   </button>
    //   <button onClick={() => handleLogin("admin")}>
    //     Login as Admin
    //   </button>
    // </div>
    <>
      {loading ? (
        <LoggingIn />
      ) : (
        <div className="">
          <div className="mt-8 mb-6">
            <h4 className="text-xl font-semibold">Log in to MC. Companion</h4>
            <p className="text-muted text-sm">Sign in to continue learning</p>
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
              Log in
            </button>
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/signup"
                className="text-sm dark:text-muted text-black flex items-center justify-center gap-2 cursor-pointer hover:text-primary transition-all duration-300 w-fit"
              >
                <Icon icon="ph:arrow-left" width={16} />
                Back
              </Link>
              <Link
                href="/forgot-password"
                className="text-sm dark:text-muted text-black flex items-center justify-center gap-2 cursor-pointer hover:text-primary transition-all duration-300 w-fit"
              >
                Forgot Password?
              </Link>
            </div>
          </form>

          <p className="text-sm text-center font-medium flex items-center justify-center gap-2 cursor-pointer text-muted mt-4">
            Don't have an account?
            <Link href="/signup">
              <span className="underline dark:text-muted text-black cursor-pointer text-black hover:text-primary transition-all duration-300">
                Sign Up
              </span>
            </Link>
          </p>
        </div>
      )}
    </>
  );
};

interface LoginFormInputs {
  email: string;
  password: string;
}
