import { useQuery } from "@tanstack/react-query";
import {
  getActiveStudentsTotal,
  getAtRiskStudents,
  getPlatformOverview,
  getProspectiveStudentsTotal,
  getStaffOverview,
  getTeacherPerformance,
} from "../services/analytics.service";

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

export const usePlatformOverview = () =>
  useQuery({
    queryKey: ["admin", "analytics", "overview"],
    queryFn: getPlatformOverview,
  });

export const useStudentPopulationCounts = () => {
  const active = useQuery({
    queryKey: ["admin", "active-students", "total"],
    queryFn: getActiveStudentsTotal,
  });
  const prospective = useQuery({
    queryKey: ["admin", "prospective-students", "total"],
    queryFn: getProspectiveStudentsTotal,
  });

  return {
    activeTotal: active.data ?? 0,
    prospectiveTotal: prospective.data ?? 0,
    isLoading: active.isLoading || prospective.isLoading,
  };
};

export const useStaffOverview = (days: number) =>
  useQuery({
    queryKey: ["admin", "analytics", "staff", days],
    queryFn: () => getStaffOverview(days),
  });
