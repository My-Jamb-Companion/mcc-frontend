import {useState} from "react";
import SignupForm from "./SignUpForm";
import ContinueWithAccount from "./ContinueSignUp";

export default function SignUp() {
  // const [showContinueWithAccount, setShowContinueWithAccount] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  return (
    <>
      {showSignupForm ? (
        <SignupForm back={setShowSignupForm} />
      ) : (
        <ContinueWithAccount mail={setShowSignupForm} />
      )}
    </>
  );
}
