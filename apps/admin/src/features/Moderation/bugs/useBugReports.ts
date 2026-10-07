import {keepPreviousData, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {BugReportFilters, listBugReports, updateBugReport} from "./bugReports.service";
import type {BugStatus} from "./bugStatus";

const KEY = ["admin-bug-reports"];

export const useBugReports = (filters: BugReportFilters) =>
  useQuery({queryKey: [...KEY, filters], queryFn: () => listBugReports(filters), placeholderData: keepPreviousData});

export const useUpdateBugReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({reportId, input}: {reportId: string; input: {status?: BugStatus; admin_note?: string}}) =>
      updateBugReport(reportId, input),
    onSuccess: () => queryClient.invalidateQueries({queryKey: KEY}),
  });
};
