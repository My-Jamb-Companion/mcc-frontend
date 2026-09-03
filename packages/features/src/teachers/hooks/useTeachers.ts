import { useQuery } from "@tanstack/react-query";
import { getTeachersApi } from "../services/teacher.service";
import { GetTeachersParams, Teacher } from "../types";

export const useTeachers = (params?: GetTeachersParams) => {
  return useQuery<Teacher[]>({
    queryKey: ["teachers", params],
    queryFn: () => getTeachersApi(params),
  });
};
