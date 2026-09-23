import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {disableActiveStudent, listActiveStudents} from "../services/student.service";
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
