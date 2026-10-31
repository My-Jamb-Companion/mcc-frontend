"use client";

import { useState } from "react";
import { Button } from "@mcc/ui";
import type { CatalogueTierPrice } from "./payments.service";
import { useCourseCatalogue, useEnrollChildInCourse, useProgramCatalogue, useRegisterChildForExam } from "./usePayments";
import { FormatCards } from "./FormatCards";
import { WhatYouGet } from "./WhatYouGet";
import { defaultTierId, formatFor, priceOf, tiersFor, type CatalogueFormat, type LiveFormat } from "./formats";

const formatPrice = (price: string) => {
  const amount = Number(price);
  return amount > 0 ? `₦${amount.toLocaleString()}` : "Free";
};

interface ChildCheckoutProps {
  childId: string;
  childName: string;
}

export const ChildCheckout = ({ childId, childName }: ChildCheckoutProps) => {
  const { data: courses, isLoading: coursesLoading } = useCourseCatalogue(childId);
  const { data: programs, isLoading: programsLoading } = useProgramCatalogue(childId);
  const enrollInCourse = useEnrollChildInCourse(childId);
  const registerForExam = useRegisterChildForExam(childId);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Live teaching is optional: the parent picks self-paced, a live group of five, or 1-to-1 per program.
  const [selectedFormats, setSelectedFormats] = useState<Record<string, LiveFormat>>({});

  /**
   * Everything the row needs for one program once the format is resolved. Parents do not choose a tier: every
   * purchase is charged the admin's default tier, in whichever format they pick.
   */
  const choiceFor = (
    id: string,
    price: string,
    tierPrices: CatalogueTierPrice[],
    formats: CatalogueFormat[] | undefined,
  ) => {
    const format = formatFor(formats, selectedFormats[id]);
    const tierId = defaultTierId(formats, tierPrices, price);
    const shown = priceOf(tiersFor(formats, format, tierPrices), tierId, price);
    return { format, tierId, shown };
  };

  const handleEnroll = async (courseId: string, price: string, tierId?: string, liveFormat?: LiveFormat) => {
    setPendingId(courseId);
    setMessage(null);
    setError(null);
    try {
      const result = await enrollInCourse.mutateAsync({ courseId, price, tierId, liveFormat });
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

  const handleRegister = async (programId: string, tierId?: string, liveFormat?: LiveFormat) => {
    setPendingId(programId);
    setMessage(null);
    setError(null);
    try {
      const result = await registerForExam.mutateAsync({ programId, tierId, liveFormat });
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
            {courses?.map((course) => {
              const { format, tierId, shown } = choiceFor(course.course_id, course.price, course.tier_prices, course.formats);
              return (
                <li
                  key={course.course_id}
                  className="rounded-lg border border-muted/20 px-4 py-3 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-xs text-muted">{formatPrice(shown)}</p>
                    </div>
                    <Button
                      size="sm"
                      loading={pendingId === course.course_id}
                      onClick={() => handleEnroll(course.course_id, course.price, tierId, format)}
                    >
                      Enroll
                    </Button>
                  </div>
                  <FormatCards
                    groupId={course.course_id}
                    formats={course.formats ?? []}
                    value={format}
                    tierId={tierId}
                    onChange={(f) => setSelectedFormats((prev) => ({...prev, [course.course_id]: f}))}
                  />
                  <WhatYouGet kind="course" formats={course.formats ?? []} format={format} />
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium text-muted mb-2">Exam-prep programs</h3>
          {programsLoading && <p className="text-sm text-muted">Loading…</p>}
          {programs && programs.length === 0 && (
            <p className="text-sm text-muted">No programs available right now.</p>
          )}
          <ul className="space-y-2">
            {programs?.map((program) => {
              const { format, tierId, shown } = choiceFor(program.program_id, program.price, program.tier_prices, program.formats);
              return (
                <li
                  key={program.program_id}
                  className="rounded-lg border border-muted/20 px-4 py-3 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{program.exam_name || program.subject_name}</p>
                      <p className="text-xs text-muted">{formatPrice(shown)}</p>
                    </div>
                    <Button
                      size="sm"
                      loading={pendingId === program.program_id}
                      onClick={() => handleRegister(program.program_id, tierId, format)}
                    >
                      Register
                    </Button>
                  </div>
                  <FormatCards
                    groupId={program.program_id}
                    formats={program.formats ?? []}
                    value={format}
                    tierId={tierId}
                    onChange={(f) => setSelectedFormats((prev) => ({...prev, [program.program_id]: f}))}
                  />
                  <WhatYouGet kind="exam" formats={program.formats ?? []} format={format} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};
