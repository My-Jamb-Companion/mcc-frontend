"use client"

import { useRouter } from "next/navigation";
import { LoginForm } from "@mcc/features/auth";

export default function LoginPage() {

    const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <LoginForm 
            onSuccess={() => {
        router.push("/admin/dashboard");
      }}
      />
    </div>
  );
}