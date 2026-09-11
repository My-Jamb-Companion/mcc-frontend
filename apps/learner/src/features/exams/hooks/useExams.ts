import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getEnrolledPrograms, getPrograms, registerForProgram} from "../services/exam.service";

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
    mutationFn: ({programId, email}: {programId: string; email?: string}) =>
      registerForProgram(programId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["exam-programs", "enrolled"]});
    },
  });
};
