"use client";

import SignUp from "@/src/features/signup/components/SignUp";
import {useRouter} from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  return <SignUp />;
}
