import {ApiExamProgramDetail} from "../services/exam.service";
import {ProgramDetailData} from "../components/ProgramRow";
import {toExamType, toUiStatus} from "./list.mapper";
import {fromApiLevelToDifficulty} from "./helper";

/** Real lecture count across the program's whole topic tree -- the same
 * "count what's actually there" approach OpenCourse.tsx already uses for
 * its own `lessons` number, rather than a stat with no backing data. */
function countLectures(api: ApiExamProgramDetail): number {
  return (api.topics ?? []).reduce(
    (total, topic) =>
      total +
      (topic.sub_topics ?? []).reduce(
        (subTotal, subTopic) =>
          subTotal +
          (subTopic.modules ?? []).reduce(
            (modTotal, mod) => modTotal + (mod.lectures?.length ?? 0),
            0,
          ),
        0,
      ),
    0,
  );
}

/** Real practice/quiz/test question count across the whole tree. */
function countPracticeTests(api: ApiExamProgramDetail): number {
  return (api.topics ?? []).reduce(
    (total, topic) =>
      total +
      (topic.sub_topics ?? []).reduce((subTotal, subTopic) => {
        const moduleQuestions = (subTopic.modules ?? []).reduce(
          (modTotal, mod) =>
            modTotal + (mod.quizzes?.length ?? 0) + (mod.practices?.length ?? 0),
          0,
        );
        return subTotal + moduleQuestions + (subTopic.test_exercises?.length ?? 0);
      }, 0),
    0,
  );
}

/**
 * Adapts GET /admin/exams/programs/{program_id} into ProgramDetailData for
 * OpenProgram.tsx -- the display counterpart to detail.mapper.ts's
 * fromApiExamProgramDetail, which instead targets the edit form. `stats`
 * only fills in what's genuinely computable from the response (lecture and
 * question counts); `students`/resource counts have no real backing
 * anywhere yet, so they stay 0 rather than invented, matching
 * OpenCourse.tsx's own EMPTY_PROGRAM_STATS fallback for the same gap.
 * `features` has no backing at all, so it's left unset -- OpenProgram.tsx
 * already falls back to EMPTY_PROGRAM_FEATURES when absent.
 */
export function fromApiExamProgramToDisplay(
  api: ApiExamProgramDetail,
): ProgramDetailData {
  return {
    id: api.program_id,
    examId: api.exam_id,
    examType: toExamType(api.exam_name),
    teacherName: api.teacher_name ?? "Unassigned",
    rating: Number(api.rating || 0).toFixed(1),
    // Not returned by any endpoint yet -- see list.mapper.ts's same note.
    reviewCount: "0",
    title: api.exam_name
      ? `${api.exam_name} - ${api.subject_name ?? "Untitled subject"}`
      : (api.subject_name ?? "Untitled program"),
    tags: [api.category_name, api.subject_name].filter(
      (tag): tag is string => Boolean(tag),
    ),
    status: toUiStatus(api.status),
    price: Number(api.price || 0),
    currency: "₦",
    link: `https://mcc.com/${api.program_id}`,
    instructor: api.teacher_name ?? undefined,
    description: api.description || undefined,
    imgBig: api.cover_image_url ?? undefined,
    meta: {
      lessons: countLectures(api),
      difficulty: fromApiLevelToDifficulty(api.level),
    },
    stats: {
      students: 0,
      hoursOfVideo: 0,
      practiceTests: countPracticeTests(api),
      additionalResources: 0,
      downloadableResources: 0,
    },
  };
}
