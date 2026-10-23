// @vitest-environment jsdom
import {describe, expect, it, vi} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type {ReactNode} from "react";
import {useExamProgramEdit} from "./useExamPrograms";

const api = vi.hoisted(() => ({get: vi.fn()}));
vi.mock("../services/exam.service", async (orig) => ({...(await orig<typeof import("../services/exam.service")>()), getExamProgram: (...a: unknown[]) => api.get(...a)}));

const program = (description: string, topics: unknown[] = []) => ({
  program_id: "p", exam_id: "e", subject_id: "s", category_id: "c", teacher_id: "t", description, price: "0", level: "all", tags: [],
  learning_outcomes: [], status: "draft", rating: "0", cover_image_url: null, promo_video_url: null, topics, content_version: 1,
  created_at: "", updated_at: "", published_at: null, exam_name: "JAMB", subject_name: "English", category_name: "Languages", teacher_name: "T", teacher_avatar: null,
});

/**
 * The failure behind lectures, practices and exercises "disappearing": the edit page filled its form from the query cache's
 * copy of the program, which was kept for minutes after the last visit and handed out first. Saving a form filled from that
 * older copy replaced everything added since.
 */
describe("the edit page's copy of a program", () => {
  const wrapper = (client: QueryClient) => ({children}: {children: ReactNode}) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

  it("is never one left in the cache by an earlier visit", async () => {
    const client = new QueryClient();
    api.get.mockResolvedValueOnce(program("as it was at the first visit"));
    const first = renderHook(() => useExamProgramEdit("p"), {wrapper: wrapper(client)});
    await waitFor(() => expect(first.result.current.data?.values.description).toBe("as it was at the first visit"));
    first.unmount();
    await new Promise((resolve) => setTimeout(resolve, 20)); // the admin goes elsewhere and does some work

    // The admin added content since, then opens the editor again.
    api.get.mockResolvedValueOnce(program("as it is now"));
    const second = renderHook(() => useExamProgramEdit("p"), {wrapper: wrapper(client)});

    expect(second.result.current.data).toBeUndefined(); // not the old copy, not even for a moment
    await waitFor(() => expect(second.result.current.data?.values.description).toBe("as it is now"));
    expect(second.result.current.isFetchedAfterMount).toBe(true);
  });

  it("is only marked fresh once fetched after the page opened, even if an older copy is still in the cache", async () => {
    const client = new QueryClient();
    api.get.mockResolvedValueOnce(program("older copy"));
    const first = renderHook(() => useExamProgramEdit("p"), {wrapper: wrapper(client)});
    await waitFor(() => expect(first.result.current.data).toBeDefined());
    first.unmount();

    // Reopened at once: the query may still hold the older copy, and then it must not count as fresh.
    api.get.mockImplementationOnce(() => new Promise(() => undefined)); // the new request is still on its way
    const second = renderHook(() => useExamProgramEdit("p"), {wrapper: wrapper(client)});
    expect(second.result.current.isFetchedAfterMount).toBe(false);
  });

  it("carries the content version the server gave", async () => {
    const client = new QueryClient();
    api.get.mockResolvedValueOnce(program("x"));
    const {result} = renderHook(() => useExamProgramEdit("p"), {wrapper: wrapper(client)});
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.values.contentVersion).toBe(1);
  });
});
