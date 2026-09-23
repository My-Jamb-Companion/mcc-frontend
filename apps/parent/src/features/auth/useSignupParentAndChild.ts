import { useMutation } from "@tanstack/react-query";
import { signupParentAndChild } from "./signup.service";

export const useSignupParentAndChild = () =>
  useMutation({ mutationFn: signupParentAndChild });
