"use client";

import {useEffect, useRef} from "react";
import {useFormContext} from "@mcc/features";
import {Icon} from "@mcc/ui";
import {useCourseStore, getPendingCourseFromStorage} from "@mcc/store";
import {useCourses} from "@/src/features/courses/hooks/useCourses";
import {usePrograms} from "@/src/features/exams/hooks/useExams";
import {CourseSelectStep, SelectedOnboardingItem} from "../types/formTypes";

const FALLBACK_IMAGE = "/assets/images/tower.jpg";
const MAX_ITEMS = 15;

interface CatalogueItem {
  id: string;
  kind: "course" | "program";
  title: string;
  image: string;
  price: number;
}

function SelectableCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-muted/20 p-3">
      <div className="aspect-video w-full rounded-xl bg-muted/20 animate-pulse" />
      <div className="h-4 w-3/4 rounded-full bg-muted/20 animate-pulse" />
      <div className="h-3 w-1/3 rounded-full bg-muted/20 animate-pulse" />
    </div>
  );
}

/**
 * The onboarding wizard's final step: a mandatory course/program pick so a
 * fresh signup has something enrolled and can book an onboarding call
 * (apps/learner/src/features/booking) rather than landing on an empty
 * dashboard. Catalogue is capped at MAX_ITEMS -- the full thing is always
 * one click away on /explore after onboarding.
 */
export function CourseSelectRenderer({step}: {step: CourseSelectStep}) {
  const {setValue, watch} = useFormContext();
  const {courses, isLoading: coursesLoading} = useCourses();
  const {programs, isLoading: programsLoading} = usePrograms();
  const {pendingCourse, clearPendingCourse} = useCourseStore();

  const selected: SelectedOnboardingItem[] = watch(step.fieldId) || [];
  const appliedPendingRef = useRef(false);

  const items: CatalogueItem[] = [
    ...courses.map((c) => ({
      id: c.course_id,
      kind: "course" as const,
      title: c.title,
      image: c.cover_image_url || FALLBACK_IMAGE,
      price: Number(c.price),
    })),
    ...programs.map((p) => ({
      id: p.program_id,
      kind: "program" as const,
      title: [p.exam_name, p.subject_name].filter(Boolean).join(" — ") || "Exam program",
      image: p.cover_image_url || FALLBACK_IMAGE,
      price: Number(p.price),
    })),
  ].slice(0, MAX_ITEMS);

  // Honor a course picked pre-signup on the landing page by pre-selecting
  // it here, once, as soon as the catalogue it belongs to has loaded.
  useEffect(() => {
    if (appliedPendingRef.current) return;
    if (coursesLoading || programsLoading) return;
    const pending = pendingCourse ?? getPendingCourseFromStorage();
    if (!pending) {
      appliedPendingRef.current = true;
      return;
    }
    const pendingKind = pending.kind === "exam" ? "program" : "course";
    const match = items.find((i) => i.id === pending.id && i.kind === pendingKind);
    appliedPendingRef.current = true;
    if (match) {
      const current: SelectedOnboardingItem[] = watch(step.fieldId) || [];
      if (!current.some((s) => s.id === match.id && s.kind === match.kind)) {
        setValue(step.fieldId, [
          ...current,
          {id: match.id, kind: match.kind, price: match.price},
        ]);
      }
    }
    clearPendingCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coursesLoading, programsLoading]);

  const toggleItem = (item: CatalogueItem) => {
    const isSelected = selected.some((s) => s.id === item.id && s.kind === item.kind);
    if (isSelected) {
      setValue(
        step.fieldId,
        selected.filter((s) => !(s.id === item.id && s.kind === item.kind)),
      );
    } else {
      setValue(step.fieldId, [...selected, {id: item.id, kind: item.kind, price: item.price}]);
    }
  };

  const isLoading = coursesLoading || programsLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto p-1">
        {isLoading &&
          Array.from({length: 6}).map((_, i) => <SelectableCardSkeleton key={i} />)}
        {!isLoading && items.length === 0 && (
          <p className="col-span-full text-sm text-muted text-center py-6">
            Nothing available to enrol into right now.
          </p>
        )}
        {!isLoading &&
          items.map((item) => {
            const isSelected = selected.some((s) => s.id === item.id && s.kind === item.kind);
            const isFree = item.price === 0;
            return (
              <button
                type="button"
                key={`${item.kind}-${item.id}`}
                onClick={() => toggleItem(item)}
                className={`relative flex flex-col gap-2 rounded-2xl border p-3 text-left transition cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-muted/30 hover:bg-hint/30"
                }`}
              >
                {isSelected && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                    <Icon icon="ri:check-line" size={14} />
                  </div>
                )}
                <div className="aspect-video w-full overflow-hidden rounded-xl">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-xs text-subtle">
                  {item.kind === "course" ? "Course" : "Exam Program"}
                </span>
                <p className="text-sm font-semibold leading-snug line-clamp-2">{item.title}</p>
                <span
                  className={`w-fit rounded-lg px-2 py-0.5 text-xs font-medium ${
                    isFree ? "bg-green-100 text-green-700" : "bg-muted/20 text-subtle"
                  }`}
                >
                  {isFree ? "Free" : `₦${item.price.toLocaleString()}`}
                </span>
              </button>
            );
          })}
      </div>
      {items.length >= MAX_ITEMS && (
        <p className="text-xs text-muted text-center">
          Showing the first {MAX_ITEMS} -- browse the full catalogue later from Explore.
        </p>
      )}
    </div>
  );
}
