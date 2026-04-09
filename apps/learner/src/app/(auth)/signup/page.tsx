"use client";

import SignUp from "@/src/features/auth/components/signUp";
import {useRouter} from "next/navigation";

export default function SigninPage() {
  const router = useRouter();

  return <SignUp />;
}
