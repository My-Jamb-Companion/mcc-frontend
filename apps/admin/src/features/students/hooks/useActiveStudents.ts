import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  disableActiveStudent,
  enrollActiveStudent,
  getActiveStudent,
  listActiveStudents,
  unenrollActiveStudent,
} from "../services/student.service";
import {fromApiActiveStudent} from "../helper/student.mapper";

/**
 * Lists active students from the live backend (GET /admin/active-students),
 * adapted into the local Student shape ActiveTable already renders.
 */
export const useActiveStudents = () => {
  const query = useQuery({
    queryKey: ["active-students"],
    queryFn: () => listActiveStudents().then((rows) => rows.map(fromApiActiveStudent)),
  });

  return {...query, students: query.data ?? []};
};

export const useDisableActiveStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => disableActiveStudent(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["active-students"]});
    },
  });
};

/** One active student's per-program performance -- the enrolled programs
 * EnrollStudentModal renders as the "Enrollment List". */
export const useActiveStudentPrograms = (userId: string | null | undefined) => {
  const query = useQuery({
    queryKey: ["active-student", userId],
    queryFn: () => getActiveStudent(userId as string),
    enabled: !!userId,
  });

  return {...query, programPerformance: query.data?.program_performance ?? []};
};

export const useEnrollActiveStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      programId,
      programType,
    }: {
      userId: string;
      programId: string;
      programType: "course" | "exam";
    }) => enrollActiveStudent(userId, programId, programType),
    onSuccess: (_data, {userId}) => {
      queryClient.invalidateQueries({queryKey: ["active-student", userId]});
      queryClient.invalidateQueries({queryKey: ["active-students"]});
    },
  });
};

export const useUnenrollActiveStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      programId,
      programType,
    }: {
      userId: string;
      programId: string;
      programType: "course" | "exam";
    }) => unenrollActiveStudent(userId, programId, programType),
    onSuccess: (_data, {userId}) => {
      queryClient.invalidateQueries({queryKey: ["active-student", userId]});
      queryClient.invalidateQueries({queryKey: ["active-students"]});
    },
  });
};
