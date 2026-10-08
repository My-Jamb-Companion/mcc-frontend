import {LegalLink} from "@mcc/ui";

export default function layout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <div className="flex justify-center gap-4 h-screen p-10">
      <div className="w-full flex flex-col">
        <div className="my-auto text-center w-full max-w-[320px] mx-auto h-full">
          <h4 className="text-xl mb-auto">
            <span className="text-primary font-bagel">MC. </span>
            Companion
          </h4>
          {children}
        </div>

        <p className="text-subtle w-full text-xs text-center p-6 self-end">
          By continuing, I acknowledge the
          {" "}<LegalLink doc="privacy">Privacy Policy</LegalLink>{" "}
          and agree to the{" "}
          <LegalLink doc="terms">Terms of Use</LegalLink>
        </p>
      </div>
    </div>
  );
}
