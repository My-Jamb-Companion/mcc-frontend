"use client";

import { useState } from "react";
import { Button } from "@mcc/ui";
import { useCourseCatalogue, useEnrollChildInCourse, useProgramCatalogue, useRegisterChildForExam } from "./usePayments";

const formatPrice = (price: string) => {
  const amount = Number(price);
  return amount > 0 ? `₦${amount.toLocaleString()}` : "Free";
};

interface ChildCheckoutProps {
  childId: string;
  childName: string;
}

export const ChildCheckout = ({ childId, childName }: ChildCheckoutProps) => {
  const { data: courses, isLoading: coursesLoading } = useCourseCatalogue();
  const { data: programs, isLoading: programsLoading } = useProgramCatalogue();
  const enrollInCourse = useEnrollChildInCourse(childId);
  const registerForExam = useRegisterChildForExam(childId);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async (courseId: string, price: string) => {
    setPendingId(courseId);
    setMessage(null);
    setError(null);
    try {
      const result = await enrollInCourse.mutateAsync({ courseId, price });
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
        return;
      }
      setMessage(`${childName} is now enrolled.`);
    } catch {
      setError("Couldn't start this enrollment. Please try again.");
    } finally {
      setPendingId(null);
    }
  };

  const handleRegister = async (programId: string) => {
    setPendingId(programId);
    setMessage(null);
    setError(null);
    try {
      const result = await registerForExam.mutateAsync(programId);
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
        return;
      }
      setMessage(`${childName} is now registered.`);
    } catch {
      setError("Couldn't start this registration. Please try again.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section>
      <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
        Pay for a course or exam-prep program
      </h2>

      {message && <p className="text-sm text-success mb-3">{message}</p>}
      {error && <p className="text-sm text-danger mb-3">{error}</p>}

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-medium text-muted mb-2">Courses</h3>
          {coursesLoading && <p className="text-sm text-muted">Loading…</p>}
          {courses && courses.length === 0 && (
            <p className="text-sm text-muted">No courses available right now.</p>
          )}
          <ul className="space-y-2">
            {courses?.map((course) => (
              <li
                key={course.course_id}
                className="flex items-center justify-between rounded-lg border border-muted/20 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-xs text-muted">{formatPrice(course.price)}</p>
                </div>
                <Button
                  size="sm"
                  loading={pendingId === course.course_id}
                  onClick={() => handleEnroll(course.course_id, course.price)}
                >
                  Enroll
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium text-muted mb-2">Exam-prep programs</h3>
          {programsLoading && <p className="text-sm text-muted">Loading…</p>}
          {programs && programs.length === 0 && (
            <p className="text-sm text-muted">No programs available right now.</p>
          )}
          <ul className="space-y-2">
            {programs?.map((program) => (
              <li
                key={program.program_id}
                className="flex items-center justify-between rounded-lg border border-muted/20 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{program.exam_name || program.subject_name}</p>
                  <p className="text-xs text-muted">{formatPrice(program.price)}</p>
                </div>
                <Button
                  size="sm"
                  loading={pendingId === program.program_id}
                  onClick={() => handleRegister(program.program_id)}
                >
                  Register
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
