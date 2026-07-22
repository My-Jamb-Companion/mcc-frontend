"use client";
import {useAuth} from "@mcc/features";

export const RoleLayout = ({
  allowedRoles: _allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
}) => {
  const {user: _user} = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <div className="p-4">Unauthorized</div>;
  }

  return <>{children}</>;
};
