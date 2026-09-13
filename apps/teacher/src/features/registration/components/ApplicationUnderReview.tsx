"use client";

import { useRouter } from "next/navigation";
import { Button, Icon } from "@mcc/ui";

export default function ApplicationUnderReview({
  email,
  fullName,
}: {
  email: string;
  fullName: string;
}) {
  const router = useRouter();

  return (
    <div className="space-y-4 text-center">
      <div className="dark:bg-muted bg-hint/40 p-6 rounded-full w-fit mx-auto mt-5">
        <Icon icon="mdi:account-clock-outline" size={48} />
      </div>
      <h2 className="text-xl font-bold mt-4">Application received</h2>
      <p className="text-muted text-sm">
        Thanks, <span className="text-black font-medium dark:text-white">{fullName}</span>.
        Your teacher application is under review. We&apos;ll verify your details and email{" "}
        <span className="text-black font-medium dark:text-white">{email}</span> once your
        account is approved — you&apos;ll receive your login details then.
      </p>
      <p className="text-muted text-xs">This usually takes 1–2 business days.</p>

      <Button variant="outline" width="full" onClick={() => router.push("/login")}>
        Back to login
      </Button>
      <Button
        variant="ghost"
        width="full"
        onClick={() => router.push("/onboarding?preview=true")}
      >
        Preview the onboarding wizard
      </Button>
    </div>
  );
}
