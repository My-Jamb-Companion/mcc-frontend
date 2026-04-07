"use client";

import { useAuth } from "../hooks/useAuth";

export const LoginForm = ({
  onSuccess,
}: {
  onSuccess?: (role: string) => void;
}) => {
  const { login } = useAuth();

  const handleLogin = async (role: any) => {
    await login(role);
    onSuccess?.(role);
  };

  return (
    <div className="space-y-3">
      <button onClick={() => handleLogin("learner")}>
        Login as Learner
      </button>
      <button onClick={() => handleLogin("instructor")}>
        Login as Instructor
      </button>
      <button onClick={() => handleLogin("admin")}>
        Login as Admin
      </button>
    </div>
  );
};