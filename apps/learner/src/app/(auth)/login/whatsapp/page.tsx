"use client";

import {useRouter} from "next/navigation";
import {WhatsAppLogin} from "@mcc/features";

export default function WhatsAppLoginPage() {
  const router = useRouter();

  return (
    <WhatsAppLogin
      onSuccess={(user) =>
        router.push(user.is_onboarded ? "/dashboard" : "/onboarding")
      }
    />
  );
}
