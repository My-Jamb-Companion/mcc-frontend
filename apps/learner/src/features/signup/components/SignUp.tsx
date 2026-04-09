import {Icon} from "@mcc/ui";
import {useState} from "react";

export default function SignUp() {
  // const [showContinueWithAccount, setShowContinueWithAccount] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  return (
    <>
      {showSignupForm ? (
        <SignupForm back={setShowSignupForm} />
      ) : (
        <ContinueWithAccount mail={setShowSignupForm} />
      )}
    </>
  );
}

const ContinueWithAccount = ({mail}: {mail: (value: boolean) => void}) => {
  return (
    <div>
      <div className="mt-8 mb-6">
        <h4 className="text-xl font-semibold">Welcome to MC. Companion</h4>
        <p className="text-muted text-sm">Sign in and continue learning</p>
      </div>

      <div className="flex flex-col gap-3">
        <button className="border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/5 mx-auto rounded-full py-2.5 w-full font-medium active:scale-97 outline-primary/50 focus:outline">
          <Icon icon="material-icon-theme:google" width="18" height="18" />
          <span className="text-xs">Continue with Google</span>
        </button>
        <button className="border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/5 mx-auto rounded-full py-2.5 w-full font-medium active:scale-97 outline-primary/50 focus:outline">
          <Icon icon="logos:facebook" width="18" height="18" />
          <span className="text-xs">Continue with Facebook</span>
        </button>
        <button className="border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/5 mx-auto rounded-full py-2.5 w-full font-medium active:scale-97 outline-primary/50 focus:outline">
          <Icon icon="logos:whatsapp-icon" width="18" height="18" />
          <span className="text-xs">Continue with WhatsApp</span>
        </button>

        <h3 className="my-4">OR</h3>

        <button
          className="border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/5 mx-auto rounded-full py-2.5 w-full font-medium active:scale-97 outline-primary/50 focus:outline"
          onClick={mail.bind(null, true)}
        >
          <Icon icon="ic:baseline-email" width="18" height="18" />
          <span className="text-xs">Continue with Email</span>
        </button>
      </div>
    </div>
  );
};
