import {SelectOption} from "../components/DiscoveryFilters";

/** Matches app/features/admin/courses/schemas.py::CourseLevel exactly. */
export const COURSE_LEVEL_OPTIONS: SelectOption[] = [
  {value: "all_levels", label: "All levels"},
  {value: "beginner", label: "Beginner"},
  {value: "intermediate", label: "Intermediate"},
  {value: "advanced", label: "Advanced"},
];

/** Matches app/features/admin/exams/schemas.py::ExamLevel exactly -- note
 * "all" here, not "all_levels" as courses use. */
export const EXAM_LEVEL_OPTIONS: SelectOption[] = [
  {value: "all", label: "All levels"},
  {value: "beginner", label: "Beginner"},
  {value: "intermediate", label: "Intermediate"},
  {value: "advanced", label: "Advanced"},
];
