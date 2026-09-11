import { useQuery } from "@tanstack/react-query";
import { getAtRiskStudents, getTeacherPerformance } from "../services/analytics.service";

export const useAtRiskStudents = (days: number) =>
  useQuery({
    queryKey: ["admin", "analytics", "at-risk-students", days],
    queryFn: () => getAtRiskStudents(days),
  });

export const useTeacherPerformance = () =>
  useQuery({
    queryKey: ["admin", "analytics", "teacher-performance"],
    queryFn: getTeacherPerformance,
  });
