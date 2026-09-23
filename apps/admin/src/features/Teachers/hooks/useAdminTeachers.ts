import {useTeachers} from "@mcc/features";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useMemo} from "react";
import {fromApiTeacher} from "../helper/teacher.mapper";
import {approveTeacher, disableTeacher, rejectTeacher} from "../services/teacherActions.service";
import {
  assignProgram,
  getTeacherDetail,
  searchPrograms,
  unassignProgram,
  updateTeacherProfile,
  UpdateTeacherProfilePayload,
} from "../services/teacherPrograms.service";
import {
  assignTeacherToAssignment,
  getEscalatedAssignments,
} from "../services/escalatedAssignments.service";

/**
 * Teachers from the live backend (GET /admin/teachers via
 * @mcc/features's useTeachers), adapted into the local Teacher shape
 * TeachersTable already renders.
 *
 * Memoized on query.data: without this, `teachers` was a brand-new array
 * (with brand-new nested objects) on every render. That array is TeachersTable's
 * `data` for @tanstack/react-table, which -- per its own docs -- treats a
 * `data` reference that changes every render as "the data changed", and
 * resets internal state in response. Nothing in this tree re-renders
 * TeachersTable on its own, but the moment anything else does (any dropdown
 * on the page -- selecting a program, a date, an Actions option -- all bubble
 * a setState up to Teachers.tsx), that reset-on-every-render kicks in and
 * never stops: each reset is itself a state update, which is itself a new
 * render, which is itself "new" data. That's the freeze reported from
 * production -- confirmed live via a V8 CPU profile showing React's own
 * scheduler (processRootScheduleInMicrotask -> performSyncWorkOnRoot)
 * calling back into this exact map(), forever, pinning a render at 100%+ CPU.
 */
export const useAdminTeachers = () => {
  const query = useTeachers();
  const teachers = useMemo(() => (query.data ?? []).map(fromApiTeacher), [query.data]);

  return {...query, teachers};
};

export const useDisableTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teacherId: string) => disableTeacher(teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teachers"]});
    },
  });
};

export const useApproveTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teacherId: string) => approveTeacher(teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teachers"]});
    },
  });
};

export const useRejectTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({teacherId, reason}: {teacherId: string; reason: string}) =>
      rejectTeacher(teacherId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teachers"]});
    },
  });
};

export const useTeacherDetail = (teacherId: string | undefined) => {
  return useQuery({
    queryKey: ["teacher-detail", teacherId],
    queryFn: () => getTeacherDetail(teacherId as string),
    enabled: !!teacherId,
  });
};

export const useUpdateTeacherProfile = (teacherId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateTeacherProfilePayload) =>
      updateTeacherProfile(teacherId as string, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teachers"]});
      queryClient.invalidateQueries({queryKey: ["teacher-detail", teacherId]});
    },
  });
};

export const useSearchPrograms = (query: string) => {
  return useQuery({
    queryKey: ["program-search", query],
    queryFn: () => searchPrograms(query),
    enabled: query.trim().length > 0,
  });
};

export const useAssignProgram = (teacherId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: string) => assignProgram(teacherId as string, programId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teachers"]});
      queryClient.invalidateQueries({queryKey: ["teacher-detail", teacherId]});
    },
  });
};

export const useUnassignProgram = (teacherId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: string) => unassignProgram(teacherId as string, programId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teachers"]});
      queryClient.invalidateQueries({queryKey: ["teacher-detail", teacherId]});
    },
  });
};

export const useEscalatedAssignments = (subject: string | undefined) => {
  return useQuery({
    queryKey: ["escalated-assignments", subject],
    queryFn: () => getEscalatedAssignments(subject),
  });
};

export const useAssignTeacherToAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({assignmentId, teacherUserId}: {assignmentId: string; teacherUserId: string}) =>
      assignTeacherToAssignment(assignmentId, teacherUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teachers"]});
      queryClient.invalidateQueries({queryKey: ["escalated-assignments"]});
    },
  });
};
