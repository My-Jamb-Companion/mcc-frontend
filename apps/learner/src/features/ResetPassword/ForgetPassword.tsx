import {useForm} from "@mcc/utils";
import FormInputs from "../signup/components/FormInputs";
import OTPVerify from "./OTPVerify";
import {useState} from "react";
import NewPassword from "./NewPassword";

export default function ForgetPassword() {
  const {register, formState, handleSubmit} = useForm<Reset>();
  const errors = formState.errors;

  const [verify, setVerify] = useState(false);
  const [newPassword, setNewPassword] = useState(false);

  const onSubmit = (data: Reset) => {
    console.log(data);
  };
  const newPasswordHandler = () => {
    setVerify(false);
    setNewPassword(true);
  };
  return (
    <>
      {verify ? (
        <OTPVerify verify={newPasswordHandler} />
      ) : newPassword ? (
        <NewPassword />
      ) : (
        <>
          <div className="mt-8 mb-6">
            <h4 className="text-xl font-semibold">Reset Password</h4>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInputs
              label="Email"
              type="email"
              placeholder="Enter your email address"
              registration={register("email", {required: "Email is required"})}
              errors={errors.email}
            />
            <button
              onClick={() => setVerify(true)}
              className="bg-primary text-white border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300"
            >
              Send Code
            </button>
          </form>
        </>
      )}
    </>
  );
}
interface Reset {
  email: string;
}
