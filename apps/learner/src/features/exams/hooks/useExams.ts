import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  getEnrolledPrograms,
  getPrograms,
  getProgramContent,
  registerForProgram,
  startMockExam,
  startModuleSession,
  submitExamSession,
  updateProgramProgress,
} from "../services/exam.service";

export const usePrograms = () => {
  const query = useQuery({
    queryKey: ["exam-programs"],
    queryFn: getPrograms,
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
    mutationFn: ({programId, email, tierId}: {programId: string; email?: string; tierId?: string}) =>
      registerForProgram(programId, email, tierId),
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

  return useMutation({
    mutationFn: ({programId, progressPercent}: {programId: string; progressPercent: number}) =>
      updateProgramProgress(programId, progressPercent),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["exam-programs", "enrolled"]});
    },
  });
};

/** Starts a module-scoped (or subject-wide, if moduleId is omitted) quiz or practice session. */
export const useStartModuleSession = () =>
  useMutation({
    mutationFn: ({kind, subject, moduleId}: {kind: "quiz" | "practice"; subject: string; moduleId?: string}) =>
      startModuleSession(kind, subject, moduleId),
  });

/** Starts a sub-topic-scoped (or subject-wide, if subTopicId is omitted) mock-exam session. */
export const useStartMockExam = () =>
  useMutation({
    mutationFn: ({subject, subTopicId, limit}: {subject: string; subTopicId?: string; limit?: number}) =>
      startMockExam(subject, subTopicId, limit),
  });

export const useSubmitExamSession = () =>
  useMutation({
    mutationFn: ({
      sessionId,
      answers,
      type,
    }: {
      sessionId: string;
      answers: Record<string, string>;
      type?: "quiz" | "practice" | "exam";
    }) => submitExamSession(sessionId, answers, type),
  });
