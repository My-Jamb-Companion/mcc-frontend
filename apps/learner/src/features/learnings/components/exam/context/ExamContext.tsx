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
      // console.warn(`ExamProvider: no exam found for slug "${resolvedSlug}"`);
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

  const [activeClassroomExam, setActiveClassroomExam] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("activeClassroomExam") ?? "";
  });

  const [activeClassroomSubject, setActiveClassroomSubject] = useState<string>(
    () => {
      if (typeof window === "undefined") return "";
      return localStorage.getItem("activeClassroomSubject") ?? "";
    },
  );

  const [activeClassroomUnit, setActiveClassroomUnit] = useState<ExamUnit>(
    () => {
      if (typeof window === "undefined") return {} as ExamUnit;

      const saved = localStorage.getItem("activeClassroomUnit");

      return saved ? JSON.parse(saved) : ({} as ExamUnit);
    },
  );

  const updateActiveClassroomExam = (exam: string) => {
    setActiveClassroomExam(exam);
    localStorage.setItem("activeClassroomExam", exam);
  };

  const updateActiveClassroomSubject = (subject: string) => {
    setActiveClassroomSubject(subject);
    localStorage.setItem("activeClassroomSubject", subject);
  };

  const updateActiveClassroomUnit = (unit: ExamUnit) => {
    setActiveClassroomUnit(unit);
    localStorage.setItem("activeClassroomUnit", JSON.stringify(unit));
  };
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
        setActiveClassroomExam: updateActiveClassroomExam,
        activeClassroomSubject,
        setActiveClassroomSubject: updateActiveClassroomSubject,
        activeClassroomUnit,
        setActiveClassroomUnit: updateActiveClassroomUnit,
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
