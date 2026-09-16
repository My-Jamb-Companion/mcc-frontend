import {useTeachers} from "@mcc/features";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {fromApiTeacher} from "../helper/teacher.mapper";
import {approveTeacher, disableTeacher, rejectTeacher} from "../services/teacherActions.service";
import {
  assignProgram,
  getTeacherDetail,
  searchPrograms,
  unassignProgram,
} from "../services/teacherPrograms.service";
import {
  assignTeacherToAssignment,
  getEscalatedAssignments,
} from "../services/escalatedAssignments.service";

/**
 * Teachers from the live backend (GET /admin/teachers via
 * @mcc/features's useTeachers), adapted into the local Teacher shape
 * TeachersTable already renders.
 */
export const useAdminTeachers = () => {
  const query = useTeachers();
  const teachers = (query.data ?? []).map(fromApiTeacher);

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
