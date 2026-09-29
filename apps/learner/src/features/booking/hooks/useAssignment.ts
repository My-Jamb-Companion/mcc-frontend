import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {getAssignmentStatus, selectSlot} from "../services/booking.service";

const QUERY_KEY = ["assignment-status"];

/** The caller's assignment for one specific course/exam, if one exists --
 * GET /assignment/status returns every assignment the caller has, this
 * narrows to the one CourseContent/ExamProgramContent actually cares
 * about. */
export const useAssignmentForTarget = (purpose: "course" | "exam", targetId: string) => {
  const query = useQuery({queryKey: QUERY_KEY, queryFn: getAssignmentStatus});
  const assignment =
    query.data?.find((a) => a.purpose === purpose && a.target_id === targetId) ?? null;
  return {...query, assignment};
};

export const useSelectSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: selectSlot,
    onSuccess: () => queryClient.invalidateQueries({queryKey: QUERY_KEY}),
    onError: (error) => showError(extractApiError(error, "Couldn't book that slot")),
  });
};
