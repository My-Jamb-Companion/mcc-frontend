import type {ListExamProgramsMeta, ListExamProgramsParams} from "../services/exam.service";

export const PAGE_SIZE = 15;

export type ListTab = "published" | "drafts";

/** The list screen's controls as the API's query: filtering and paging happen on the server. */
export function toListParams(input: {
  tab: ListTab;
  search: string;
  teacherId?: string;
  page: number;
}): ListExamProgramsParams {
  const search = input.search.trim();
  return {
    status: input.tab === "published" ? "published" : "draft",
    page: input.page,
    limit: PAGE_SIZE,
    ...(search ? {search} : {}),
    ...(input.teacherId ? {teacher_id: input.teacherId} : {}),
  };
}

/** "16–30 of 42 results", "1 result", or "No results". */
export function resultsLabel(meta?: Pick<ListExamProgramsMeta, "page" | "per_page" | "total">): string {
  if (!meta || meta.total === 0) return "No results";
  if (meta.total === 1) return "1 result";
  const from = (meta.page - 1) * meta.per_page + 1;
  const to = Math.min(meta.page * meta.per_page, meta.total);
  return `${from}–${to} of ${meta.total} results`;
}
