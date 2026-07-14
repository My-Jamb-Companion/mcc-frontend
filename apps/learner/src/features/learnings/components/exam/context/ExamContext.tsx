"use client";

import {examDetails} from "@/src/features/constants/demoExams";
import type {ExamSubject, ExamUnit} from "@/src/features/constants/demoExams";
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
  activeClassroomExam: string;
  setActiveClassroomExam: (exam: string) => void;
  activeClassroomSubject: string;
  setActiveClassroomSubject: (subject: string) => void;
  activeClassroomUnit: ExamUnit;
  setActiveClassroomUnit: (unit: ExamUnit) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

interface ExamProviderProps {
  children: ReactNode;
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
    if (lastSlugRef.current === resolvedSlug) return;
    lastSlugRef.current = resolvedSlug;
    setSelectedSubjectIds(
      subjects.filter((s) => s.isEnrolled).map((s) => s.id),
    );
  }, [resolvedSlug, subjects]);

  const {hasUnpaidSelection, totalPrice} = useMemo(() => {
    const selected = subjects.filter((s) => selectedSubjectIds.includes(s.id));
    return {
      hasUnpaidSelection: selected.some((s) => !s.isEnrolled),
      totalPrice: selected
        .filter((s) => !s.isEnrolled)
        .reduce((sum, s) => sum + s.price, 0),
    };
  }, [selectedSubjectIds, subjects]);

  const [activeClassroomExam, setActiveClassroomExam] = useState<string>("");
  const [activeClassroomSubject, setActiveClassroomSubject] =
    useState<string>("");
  const [activeClassroomUnit, setActiveClassroomUnit] = useState<ExamUnit>(
    {} as ExamUnit,
  );
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
        activeClassroomExam,
        setActiveClassroomExam,
        activeClassroomSubject,
        setActiveClassroomSubject,
        activeClassroomUnit,
        setActiveClassroomUnit,
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
