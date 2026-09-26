import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  assignCraToProspectiveStudent,
  listProspectiveStudents,
  rejectProspectiveStudent,
} from "../services/student.service";
import {fromApiProspectiveStudent} from "../helper/student.mapper";
import {listUsers} from "@/src/features/Settings/services/users.service";

export interface ProspectiveStudentsFilters {
  search?: string;
  /** Signup method -- matches users.auth_provider (email/google/facebook/whatsapp). */
  method?: string;
}

/**
 * Lists prospective students from the live backend
 * (GET /admin/prospective-students), adapted into the local
 * ProspectiveStudent shape ProspectiveTable already renders. Filters are
 * part of the query key so changing one is a real new request, not
 * client-side filtering of an already-fetched page.
 */
export const useProspectiveStudents = (filters: ProspectiveStudentsFilters = {}) => {
  const query = useQuery({
    queryKey: ["prospective-students", filters],
    queryFn: () =>
      listProspectiveStudents({
        search: filters.search || undefined,
        method: filters.method || undefined,
      }).then((rows) => rows.map(fromApiProspectiveStudent)),
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

/** Active CRAs to populate the "Assign CRA" picker -- GET /admin/users?role=cra. */
export const useCras = () => {
  const query = useQuery({
    queryKey: ["users", {role: "cra", is_active: "true"}],
    queryFn: () => listUsers({role: "cra", is_active: "true"}),
  });

  return {...query, cras: query.data ?? []};
};

export const useAssignCraToProspectiveStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({userId, craId}: {userId: string; craId: string}) =>
      assignCraToProspectiveStudent(userId, craId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["prospective-students"]});
    },
  });
};
