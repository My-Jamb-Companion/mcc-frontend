import { create } from "zustand";

export interface PendingCourse {
  id: string;
  title: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  // "course" (default, omitted by every pre-existing caller) or "exam" for an
  // exam-prep program — added for the Landing Page's enrolment flow
  // (backend/docs/multi-portal-plan.md Phase 2), which needs to remember
  // which of the two POST /courses/enroll vs POST /exams/register to resume
  // after the browse → signup/login round trip. Optional so every existing
  // course-only caller is unaffected.
  kind?: "course" | "exam";
}

const STORAGE_KEY = "mcc_pending_course";

export const getPendingCourseFromStorage = (): PendingCourse | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingCourse) : null;
  } catch {
    return null;
  }
};

const savePendingCourseToStorage = (course: PendingCourse) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(course));
};

const clearPendingCourseFromStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};

type CourseState = {
  pendingCourse: PendingCourse | null;
  setPendingCourse: (course: PendingCourse) => void;
  clearPendingCourse: () => void;
};

export const useCourseStore = create<CourseState>((set) => ({
  pendingCourse: null,
  setPendingCourse: (course) => {
    savePendingCourseToStorage(course);
    set({ pendingCourse: course });
  },
  clearPendingCourse: () => {
    clearPendingCourseFromStorage();
    set({ pendingCourse: null });
  },
}));
