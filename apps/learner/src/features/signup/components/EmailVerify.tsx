import {Icon} from "@mcc/ui";

export default function EmailVerify({email}: {email: string}) {
  return (
    <div className="space-y-4">
      <div className="dark:bg-muted bg-hint/40 p-6 rounded-full w-fit mx-auto mt-5">
        <Icon icon="hugeicons:mail-open" width="48" height="48" />
      </div>
      <h2 className="text-xl font-bold mt-4">Verify Your Email</h2>
      <p className="text-muted text-sm">
        We sent you a verification email to{" "}
        <span className="text-black font-medium dark:text-white">{email}.</span>{" "}
        Please tap the link inside that email to continue.
      </p>

      <p className="text-muted text-sm font-medium">
        Having trouble?{" "}
        <span className="text-black font-medium dark:text-white cursor-pointer hover:text-primary transition-all duration-300">
          Get help with email verification.
        </span>
      </p>

      <div className="space-y-4 mt-4">
        <button className="bg-btn-primary text-white hover:bg-primary/90 shadow-sm flex items-center justify-center gap-2 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300">
          Open email app
        </button>
        <button className="bg-none border border-muted hover:bg-muted/10 shadow-sm flex items-center justify-center gap-2 mx-auto rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300">
          Back
        </button>
      </div>
    </div>
  );
}
