"use client";

import {useState} from "react";
import SignupForm from "./SignUpForm";
import ContinueWithAccount from "./ContinueSignUp";

export default function SignUp() {
  const [showSignupForm, setShowSignupForm] = useState(false);
  return (
    <>
      {showSignupForm ? (
        <SignupForm back={() => setShowSignupForm(!showSignupForm)} />
      ) : (
        <ContinueWithAccount mail={() => setShowSignupForm(!showSignupForm)} />
      )}
    </>
  );
}
