import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  listProspectiveStudents,
  rejectProspectiveStudent,
} from "../services/student.service";
import {fromApiProspectiveStudent} from "../helper/student.mapper";

/**
 * Lists prospective students from the live backend
 * (GET /admin/prospective-students), adapted into the local
 * ProspectiveStudent shape ProspectiveTable already renders.
 */
export const useProspectiveStudents = () => {
  const query = useQuery({
    queryKey: ["prospective-students"],
    queryFn: () =>
      listProspectiveStudents().then((rows) => rows.map(fromApiProspectiveStudent)),
  });

  return {...query, students: query.data ?? []};
};

export const useRejectProspectiveStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({userId, reason}: {userId: string; reason?: string}) =>
      rejectProspectiveStudent(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["prospective-students"]});
    },
  });
};
