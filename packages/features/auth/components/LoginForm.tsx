import {useAuth} from "../hooks/useAuth";
import FormInputs from "./FormInputs";
import {useForm, FieldError} from "@mcc/utils";
import {useState} from "react";
import LoggingIn from "./LoggingIn";
import {AnimatePresence, motion} from "@mcc/ui";

export const LoginForm = ({
  onSuccess,
}: {
  onSuccess?: (role: string) => void;
}) => {
  const {login} = useAuth();

  const {register, formState, handleSubmit} = useForm<LoginFormInputs>();
  const errors = formState.errors;
  const [loading, setLoading] = useState(false);

  const onSubmit = (data: LoginFormInputs) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // handleLogin("learner");
    }, 2150);
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
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          layout
          initial={{opacity: 0, scale: 0.96}}
          animate={{opacity: 1, scale: 1}}
          exit={{opacity: 0, scale: 0.96}}
          transition={{duration: 0.35, ease: "easeInOut"}}
          className="w-full"
        >
          <motion.div layoutId="auth-card">
            <LoggingIn />
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          layout
          initial={{opacity: 0, scale: 0.96}}
          animate={{opacity: 1, scale: 1}}
          exit={{opacity: 0, scale: 0.96}}
          transition={{duration: 0.35, ease: "easeInOut"}}
          className="w-full"
        >
          <motion.div layoutId="auth-card">
            <div className="mt-8 mb-6">
              <h4 className="text-xl font-semibold">Log in to MC. Companion</h4>
              <p className="text-muted text-sm">Sign in to continue learning</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormInputs
                label="Email"
                type="email"
                placeholder="Enter your email address"
                registration={register("email", {
                  required: "Email is required",
                })}
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

              <motion.button
                layoutId="auth-button"
                className="bg-primary text-white border-muted/50 border shadow-sm dark:shadow-primary flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300"
              >
                Log in
              </motion.button>

              <div className="flex items-center justify-between gap-3">
                <a
                  href="/signup"
                  className="text-sm text-black dark:text-muted flex items-center justify-center gap-2 cursor-pointer hover:text-primary transition-all duration-300 w-fit"
                >
                  <Icon icon="eva:arrow-back-outline" width="24" height="24" />
                  <span>Back</span>
                </a>
                <a
                  href="/forget-password"
                  className="text-sm text-black dark:text-muted flex items-center justify-center gap-2 cursor-pointer hover:text-primary transition-all duration-300 w-fit"
                >
                  Forget Password?
                </a>
              </div>
            </form>

            <p className="text-sm text-center mt-4 dark:text-muted">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="underline cursor-pointer text-black dark:text-white hover:text-primary transition-all duration-300"
              >
                Sign Up
              </a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface LoginFormInputs {
  email: string;
  password: string;
}
