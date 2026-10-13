"use client";

import { useState } from "react";
import { Button } from "@mcc/ui";
import { useCourseCatalogue, useEnrollChildInCourse, useProgramCatalogue, useRegisterChildForExam } from "./usePayments";
import { TierSelect } from "./TierSelect";
import { FormatSelect } from "./FormatSelect";
import { formatFor, tierFor, tiersFor, type CatalogueFormat, type LiveFormat } from "./formats";

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
  // Selected tier per program, defaulting to whichever tier prices the
  // catalogue's own flat price (the default tier) once loaded.
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});

  // Live teaching is optional: the parent picks self-paced, a live group of five, or 1-to-1 per program.
  const [selectedFormats, setSelectedFormats] = useState<Record<string, LiveFormat>>({});

  /** Everything the row needs for one program once the format and tier are resolved. */
  const choiceFor = (
    id: string,
    price: string,
    tierPrices: {tier_id: string; tier_name: string; price: string}[],
    formats: CatalogueFormat[] | undefined,
  ) => {
    const format = formatFor(formats, selectedFormats[id]);
    const tiers = tiersFor(formats, format, tierPrices);
    const tierId = tierFor(tiers, selectedTiers[id], price);
    const shown = tiers.find((t) => t.tier_id === tierId)?.price ?? price;
    return { format, tiers, tierId, shown };
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
              const { format, tiers, tierId, shown } = choiceFor(course.course_id, course.price, course.tier_prices, course.formats);
              return (
                <li
                  key={course.course_id}
                  className="flex items-center justify-between rounded-lg border border-muted/20 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-xs text-muted">{formatPrice(shown)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FormatSelect
                      formats={course.formats ?? []}
                      value={format}
                      onChange={(f) => setSelectedFormats((prev) => ({...prev, [course.course_id]: f}))}
                    />
                    <TierSelect
                      tiers={tiers}
                      value={tierId ?? null}
                      onChange={(id) => setSelectedTiers((prev) => ({...prev, [course.course_id]: id}))}
                    />
                    <Button
                      size="sm"
                      loading={pendingId === course.course_id}
                      onClick={() => handleEnroll(course.course_id, course.price, tierId, format)}
                    >
                      Enroll
                    </Button>
                  </div>
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
              const { format, tiers, tierId, shown } = choiceFor(program.program_id, program.price, program.tier_prices, program.formats);
              return (
                <li
                  key={program.program_id}
                  className="flex items-center justify-between rounded-lg border border-muted/20 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{program.exam_name || program.subject_name}</p>
                    <p className="text-xs text-muted">{formatPrice(shown)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FormatSelect
                      formats={program.formats ?? []}
                      value={format}
                      onChange={(f) => setSelectedFormats((prev) => ({...prev, [program.program_id]: f}))}
                    />
                    <TierSelect
                      tiers={tiers}
                      value={tierId ?? null}
                      onChange={(id) => setSelectedTiers((prev) => ({...prev, [program.program_id]: id}))}
                    />
                    <Button
                      size="sm"
                      loading={pendingId === program.program_id}
                      onClick={() => handleRegister(program.program_id, tierId, format)}
                    >
                      Register
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};
