import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {confettiCelebrate, showSuccess} from "@mcc/ui";
import type {LiveFormat} from "@/src/features/courses/helper/liveFormats";
import {useGamificationRefresh} from "@/src/features/rewards/hooks/useGamificationRefresh";
import {progressMessage, shouldCelebrate} from "@/src/features/rewards/helper/earnings";
import {
  completeProgramLecture,
  getEnrolledPrograms,
  getProgramProgress,
  getPrograms,
  getProgramContent,
  ProgramListFilters,
  AssessmentMode,
  checkAssessmentAnswer,
  getAssessmentHint,
  getProgramReadiness,
  getReadinessOverview,
  registerForProgram,
  revealAssessmentAnswer,
  startAssessment,
  submitAssessment,
  updateProgramProgress,
} from "../services/exam.service";

/** The public catalogue, GET /exams/programs -- optionally filtered by
 * search/subject_id/level. Each distinct filter combination is its own
 * query-cache entry, matching useCourses' pattern. */
export const usePrograms = (filters: ProgramListFilters = {}) => {
  const query = useQuery({
    queryKey: ["exam-programs", filters],
    queryFn: () => getPrograms(filters),
  });

  return {...query, programs: query.data ?? []};
};

export const useEnrolledPrograms = () => {
  const query = useQuery({
    queryKey: ["exam-programs", "enrolled"],
    queryFn: getEnrolledPrograms,
  });

  return {...query, programs: query.data ?? []};
};

export const useRegisterForProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({programId, email, tierId, liveFormat}: {programId: string; email?: string; tierId?: string; liveFormat?: LiveFormat}) =>
      registerForProgram(programId, email, tierId, liveFormat),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["exam-programs", "enrolled"]});
    },
  });
};

/** The content tree for a program, GET /exams/<id>/content. */
export const useProgramContent = (programId: string | null | undefined) => {
  const query = useQuery({
    queryKey: ["exam-programs", programId, "content"],
    queryFn: () => getProgramContent(programId as string),
    enabled: !!programId,
  });

  return {...query, topics: query.data ?? []};
};

export const useUpdateProgramProgress = () => {
  const queryClient = useQueryClient();
  const refreshGamification = useGamificationRefresh();

  return useMutation({
    mutationFn: ({programId, progressPercent}: {programId: string; progressPercent: number}) =>
      updateProgramProgress(programId, progressPercent),
    onSuccess: (update) => {
      queryClient.invalidateQueries({queryKey: ["exam-programs", "enrolled"]});
      refreshGamification();
      const message = progressMessage(update);
      if (message) showSuccess(message);
      if (update?.progress_percent === 100 && update.points_earned > 0) confettiCelebrate();
    },
  });
};

/** The lectures the student has already finished in an exam program. */
export const useProgramProgress = (programId: string) =>
  useQuery({queryKey: ["exam-programs", programId, "progress"], queryFn: () => getProgramProgress(programId), staleTime: 0});

/** The student finishes a lecture: the server records it, works out progress and pays the points. */
export const useCompleteProgramLecture = () => {
  const queryClient = useQueryClient();
  const refreshGamification = useGamificationRefresh();

  return useMutation({
    mutationFn: ({programId, lectureId}: {programId: string; lectureId: string}) => completeProgramLecture(programId, lectureId),
    onSuccess: (update) => {
      queryClient.invalidateQueries({queryKey: ["exam-programs", "enrolled"]});
      refreshGamification();
      const message = progressMessage(update);
      if (message) showSuccess(message);
      if (update.progress_percent === 100 && update.points_earned > 0 || shouldCelebrate(update.gamification)) confettiCelebrate();
    },
  });
};

/** Starts a Practice (module) or Exercise (module or sub-topic) for the assessment player. */
export const useStartAssessment = () =>
  useMutation({
    mutationFn: ({mode, moduleId, subTopicId}: {mode: AssessmentMode; moduleId?: string; subTopicId?: string}) =>
      startAssessment(mode, {moduleId, subTopicId}),
  });

/** Checks one answer; the server says whether it is right and nothing more until it is. */
export const useCheckAnswer = () =>
  useMutation({
    mutationFn: ({sessionId, questionId, answer}: {sessionId: string; questionId: string; answer: string}) =>
      checkAssessmentAnswer(sessionId, questionId, answer),
  });

/** The next hint step for a question. */
export const useAssessmentHint = () =>
  useMutation({
    mutationFn: ({sessionId, questionId}: {sessionId: string; questionId: string}) => getAssessmentHint(sessionId, questionId),
  });

/** Skip: shows a question's answer. */
export const useRevealAnswer = () =>
  useMutation({
    mutationFn: ({sessionId, questionId}: {sessionId: string; questionId: string}) => revealAssessmentAnswer(sessionId, questionId),
  });

/** Finishes a played session: graded from what happened in it. */
export const useSubmitAssessment = () => {
  const refreshGamification = useGamificationRefresh();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => submitAssessment(sessionId),
    // A graded session may have earned points, moved a goal or extended the streak, and moved readiness.
    onSuccess: () => {
      refreshGamification();
      queryClient.invalidateQueries({queryKey: ["exam-readiness"]});
    },
  });
};

/** How ready the student is in one program: topic levels, Exam Readiness and the predicted range. */
export const useProgramReadiness = (programId: string | null | undefined) =>
  useQuery({
    queryKey: ["exam-readiness", programId],
    queryFn: () => getProgramReadiness(programId as string),
    enabled: !!programId,
  });

/** Readiness at a glance for each program the student is registered in. */
export const useReadinessOverview = () =>
  useQuery({queryKey: ["exam-readiness", "overview"], queryFn: getReadinessOverview});
