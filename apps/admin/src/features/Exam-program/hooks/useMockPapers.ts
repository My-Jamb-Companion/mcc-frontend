import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  ApiMockPaperInput,
  createMockPaper,
  deleteMockPaper,
  getMockPaper,
  getMockPool,
  listMockPapers,
  updateMockPaper,
} from "../services/mocks.service";

const key = (programId: string) => ["admin-exam-mocks", programId] as const;

/** A program's mock exam papers, drafts included. */
export const useMockPapers = (programId: string | null) =>
  useQuery({queryKey: key(programId ?? ""), queryFn: () => listMockPapers(programId as string), enabled: !!programId});

/** The modules an auto paper can draw from, and how many questions each has. */
export const useMockPool = (programId: string | null) =>
  useQuery({queryKey: ["admin-exam-mock-pool", programId], queryFn: () => getMockPool(programId as string), enabled: !!programId});

/** One paper with its authored questions, to edit it. */
export const useMockPaper = (paperId: string | null) =>
  useQuery({queryKey: ["admin-exam-mock", paperId], queryFn: () => getMockPaper(paperId as string), enabled: !!paperId, staleTime: 0});

/** Creates a paper, or saves one when `paperId` is given. */
export const useSaveMockPaper = (programId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({paperId, input}: {paperId: string | null; input: ApiMockPaperInput}) =>
      paperId ? updateMockPaper(paperId, input) : createMockPaper(programId, input),
    onSuccess: (paper) => {
      queryClient.invalidateQueries({queryKey: key(programId)});
      queryClient.invalidateQueries({queryKey: ["admin-exam-mock", paper.paper_id]});
    },
  });
};

export const useDeleteMockPaper = (programId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paperId: string) => deleteMockPaper(paperId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: key(programId)}),
  });
};
