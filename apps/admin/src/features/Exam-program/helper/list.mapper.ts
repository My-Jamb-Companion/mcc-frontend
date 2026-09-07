import {ApiExamProgramSummary} from "../services/exam.service";
import {ProgramListRowData} from "../components/ProgramRow";

const API_STATUS_TO_UI: Record<string, ProgramListRowData["status"]> = {
  published: "live",
  draft: "draft",
};

function toUiStatus(status: string): ProgramListRowData["status"] {
  return API_STATUS_TO_UI[status] ?? "draft";
}

// The list endpoint identifies an exam by free-text `exam_name` (e.g.
// "JAMB"), not the row's closed `examType` union — this maps the common
// names to it, falling back to "internal" for anything else (including the
// null exam_name seen on programs created before that field was backfilled).
const EXAM_NAME_TO_TYPE: Record<string, ProgramListRowData["examType"]> = {
  jamb: "utme",
  utme: "utme",
  waec: "waec",
  neco: "neco",
  gce: "gce",
};

function toExamType(examName: string | null): ProgramListRowData["examType"] {
  if (!examName) return "internal";
  return EXAM_NAME_TO_TYPE[examName.trim().toLowerCase()] ?? "internal";
}

/**
 * Adapts one GET /admin/exams/programs list item into ProgramListRowData so
 * ProgramList/ProgramListRow never learn the API's key names.
 */
export function fromApiExamProgramSummary(
  api: ApiExamProgramSummary,
): ProgramListRowData {
  return {
    id: api.program_id,
    examType: toExamType(api.exam_name),
    teacherName: api.teacher_name,
    rating: Number(api.rating || 0).toFixed(1),
    // Not returned by this endpoint yet.
    reviewCount: "0",
    title: api.exam_name
      ? `${api.exam_name} - ${api.subject_name}`
      : api.subject_name,
    tags: [api.category_name, api.subject_name].filter(Boolean),
    status: toUiStatus(api.status),
    price: Number(api.price || 0),
    currency: "₦",
    link: `https://mcc.com/${api.program_id}`,
  };
}
