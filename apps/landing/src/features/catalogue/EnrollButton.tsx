"use client";

import { useRouter } from "next/navigation";
import { Button } from "@mcc/ui";
import { PendingCourse, useAuthStore, useCourseStore } from "@mcc/store";
import { useCompleteEnrollment } from "../enrollment/useCompleteEnrollment";

export const EnrollButton = ({
  pending,
  label,
}: {
  pending: PendingCourse;
  label: string;
}) => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setPendingCourse = useCourseStore((s) => s.setPendingCourse);
  const { complete, isPending } = useCompleteEnrollment();

  const onClick = () => {
    setPendingCourse(pending);
    if (user) {
      complete(pending);
    } else {
      router.push("/signup");
    }
  };

  return (
    <Button variant="primary" size="sm" onClick={onClick} disabled={isPending}>
      {isPending ? "Enrolling…" : label}
    </Button>
  );
};
