"use client";

import {LoginForm} from "@mcc/features";
import {useRouter} from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center h-full ">
      <LoginForm
        more={false}
        onSuccess={() => {
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
