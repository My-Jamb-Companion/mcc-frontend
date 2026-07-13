"use client";

import {examDetails} from "@/src/features/constants/demoExams";
import type {ExamSubject} from "@/src/features/constants/demoExams";
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {useParams} from "next/navigation";

interface ExamContextType {
  selectedSubjectIds: string[];
  setSelectedSubjectIds: (ids: string[]) => void;
  viewEnrolledCourse: boolean;
  setViewEnrolledCourse: (view: boolean) => void;
  hasUnpaidSelection: boolean;
  totalPrice: number;
  subjects: ExamSubject[];
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

interface ExamProviderProps {
  children: ReactNode;
  // optional override — by default the exam slug is read straight off the
  // route (e.g. app/exams/[slug]/...), so this only needs to be passed
  // explicitly for testing, previews, or routes that don't carry a slug param
  examSlug?: string;
}

export function ExamProvider({children, examSlug}: ExamProviderProps) {
  const params = useParams<{slug?: string | string[]}>();

  const resolvedSlug = useMemo(() => {
    if (examSlug) return examSlug;
    const slugParam = params?.slug;
    if (Array.isArray(slugParam)) return slugParam[0];
    if (typeof slugParam === "string") return slugParam;
    return "utme"; // last-resort fallback if no slug is present on the route
  }, [examSlug, params?.slug]);

  const subjects = useMemo(() => {
    const exam = examDetails.find((e) => e.slug === resolvedSlug);
    if (!exam) {
      console.warn(`ExamProvider: no exam found for slug "${resolvedSlug}"`);
    }
    return exam?.subjects ?? [];
  }, [resolvedSlug]);

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(() =>
    subjects.filter((s) => s.isEnrolled).map((s) => s.id),
  );
  const [viewEnrolledCourse, setViewEnrolledCourse] = useState(false);
  const lastSlugRef = useRef(resolvedSlug);

  useEffect(() => {
    // only reset selection when the exam itself changes (e.g. navigating
    // from /exams/utme to /exams/waec) — not on every re-render, so we don't
    // stomp on choices the user made within the current exam
    if (lastSlugRef.current === resolvedSlug) return;
    lastSlugRef.current = resolvedSlug;
    setSelectedSubjectIds(
      subjects.filter((s) => s.isEnrolled).map((s) => s.id),
    );
  }, [resolvedSlug, subjects]);

  // any selected subject that isn't already enrolled means there's something
  // left to pay for, which is what the sidebar's Enroll/Access button and
  // label switch on
  const {hasUnpaidSelection, totalPrice} = useMemo(() => {
    const selected = subjects.filter((s) => selectedSubjectIds.includes(s.id));
    return {
      hasUnpaidSelection: selected.some((s) => !s.isEnrolled),
      totalPrice: selected
        .filter((s) => !s.isEnrolled)
        .reduce((sum, s) => sum + s.price, 0),
    };
  }, [selectedSubjectIds, subjects]);

  return (
    <ExamContext.Provider
      value={{
        selectedSubjectIds,
        setSelectedSubjectIds,
        viewEnrolledCourse,
        setViewEnrolledCourse,
        hasUnpaidSelection,
        totalPrice,
        subjects,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error("useExam must be used within an ExamProvider");
  }
  return context;
}
