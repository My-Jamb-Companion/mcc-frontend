import {useTeachers} from "@mcc/features";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {fromApiTeacher} from "../helper/teacher.mapper";
import {disableTeacher} from "../services/teacherActions.service";

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
