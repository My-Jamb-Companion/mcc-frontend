// @vitest-environment jsdom
import {describe, expect, it, vi} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type {ReactNode} from "react";
import {useCourse} from "./useCourses";

const api = vi.hoisted(() => ({get: vi.fn()}));
vi.mock("../services/course.service", async (orig) => ({...(await orig<typeof import("../services/course.service")>()), getCourse: (...a: unknown[]) => api.get(...a)}));

const course = (description: string) => ({
  data: {course_id: "c", title: "T", description, price: "0", level: "all_levels", tags: [], learning_outcomes: [], modules: [], teacher: null, category: null, content_version: 2},
});

/** The same failure as the exam editor: a form filled from an older copy of the course, kept by the query cache, then saved. */
describe("the course edit page's copy of a course", () => {
  const wrapper = (client: QueryClient) => ({children}: {children: ReactNode}) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

  it("is never one left in the cache by an earlier visit", async () => {
    const client = new QueryClient();
    api.get.mockResolvedValueOnce(course("first visit"));
    const first = renderHook(() => useCourse("c"), {wrapper: wrapper(client)});
    await waitFor(() => expect(first.result.current.data?.description).toBe("first visit"));
    first.unmount();
    await new Promise((resolve) => setTimeout(resolve, 20));

    api.get.mockResolvedValueOnce(course("as it is now"));
    const second = renderHook(() => useCourse("c"), {wrapper: wrapper(client)});
    expect(second.result.current.data).toBeUndefined();
    await waitFor(() => expect(second.result.current.data?.description).toBe("as it is now"));
    expect(second.result.current.isFetchedAfterMount).toBe(true);
  });

  it("is only marked fresh once fetched after the page opened", async () => {
    const client = new QueryClient();
    api.get.mockResolvedValueOnce(course("older copy"));
    const first = renderHook(() => useCourse("c"), {wrapper: wrapper(client)});
    await waitFor(() => expect(first.result.current.data).toBeDefined());
    first.unmount();
    api.get.mockImplementationOnce(() => new Promise(() => undefined));
    const second = renderHook(() => useCourse("c"), {wrapper: wrapper(client)});
    expect(second.result.current.isFetchedAfterMount).toBe(false);
  });
});
