"use client"

import { LoginForm } from "@mcc/features/auth";
import { useRouter } from "next/navigation";

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