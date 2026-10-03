import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {
  getExamProgram,
  listExamPrograms,
  ListExamProgramsParams,
} from "../services/exam.service";
import {fromApiExamProgramSummary} from "../helper/list.mapper";
import {fromApiExamProgramDetail} from "../helper/detail.mapper";
import {fromApiExamProgramToDisplay} from "../helper/display.mapper";

/**
 * Lists exam programs from the live backend (GET /admin/exams/programs),
 * adapted into ProgramListRowData so consumers don't need to know the API's
 * key names.
 */
export const useExamPrograms = (params?: ListExamProgramsParams) => {
  const query = useQuery({
    queryKey: ["exam-programs", params],
    // Keep the current page on screen while the next one (or a new filter) loads.
    placeholderData: keepPreviousData,
    queryFn: () =>
      listExamPrograms(params).then((res) => ({
        programs: res.data.map(fromApiExamProgramSummary),
        meta: res.meta,
      })),
  });

  return {
    ...query,
    programs: query.data?.programs ?? [],
    meta: query.data?.meta,
  };
};

/**
 * Fetches one exam program's full detail
 * (GET /admin/exams/programs/{program_id}), adapted into
 * ExamProgramFormValues so it can be dropped straight into
 * methods.reset(...).
 */
export const useExamProgram = (programId: string | null | undefined) => {
  return useQuery({
    queryKey: ["exam-program", programId],
    queryFn: () =>
      getExamProgram(programId as string).then(fromApiExamProgramDetail),
    enabled: !!programId,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetches one exam program's detail (same endpoint as useExamProgram)
 * adapted into ProgramDetailData for OpenProgram.tsx's read-only overview
 * page, rather than useExamProgram's ExamProgramFormValues shape, which is
 * built for CreateExamProgram's edit wizard and carries UI-only ids that
 * page has no use for.
 */
export const useExamProgramDisplay = (programId: string | null | undefined) => {
  return useQuery({
    queryKey: ["exam-program", programId, "display"],
    queryFn: () =>
      getExamProgram(programId as string).then(fromApiExamProgramToDisplay),
    enabled: !!programId,
    refetchOnWindowFocus: false,
  });
};

/**
 * One program for the edit wizard: the form values plus its status, which
 * decides whether it can be edited (the backend refuses edits to a live
 * program until it is unpublished).
 */
export const useExamProgramEdit = (programId: string | null | undefined) => {
  return useQuery({
    queryKey: ["exam-program", programId, "edit"],
    queryFn: () =>
      getExamProgram(programId as string).then((api) => ({
        values: fromApiExamProgramDetail(api),
        status: api.status,
      })),
    enabled: !!programId,
    refetchOnWindowFocus: false,
  });
};
