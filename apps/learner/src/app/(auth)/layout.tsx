import {LegalLink} from "@mcc/ui";

// import SignUpSlider from "@/src/features/signup/components/SideSlider";

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex justify-center gap-4 m-2 h-full">
      <div className="w-full flex flex-col">
        <div className="my-auto text-center w-full max-w-[320px] mx-auto">
          <h4 className="text-xl">
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

      {/* <div className="rounded-xl w-full max-w-187.5 relative overflow-hidden text-white max-lg:hidden">
        <SignUpSlider />
      </div> */}
    </div>
  );
}
