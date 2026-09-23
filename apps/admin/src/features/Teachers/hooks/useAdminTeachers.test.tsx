// @vitest-environment jsdom
/**
 * Reported from production and confirmed live (a real Chrome renderer, a
 * real mouse click, a V8 --prof capture): /dashboard/teachers froze solid at
 * 100%+ CPU the moment ANY dropdown selection re-rendered TeachersTable.
 *
 * The cause was here, not in any one dropdown: useAdminTeachers built a
 * brand-new `teachers` array (with brand-new nested objects) on every call.
 * That array is TeachersTable's `data` for @tanstack/react-table, which
 * treats a `data` reference that changes every render as "the data changed"
 * and resets internal state in response -- and each reset is itself a new
 * render, feeding the same unstable array back in, forever. Nothing
 * re-renders TeachersTable on its own, so this was invisible until the first
 * unrelated state change (any dropdown, anywhere on the page) forced one.
 *
 * This doesn't try to reproduce the infinite loop itself -- jsdom's render
 * cycle doesn't trigger react-table's reset path the same way a real
 * browser's scheduler does, which is exactly why this bug survived a full
 * headless click-through test suite undetected. It instead pins the actual
 * contract that matters: `teachers` must keep the same reference across
 * re-renders when the underlying query data hasn't changed.
 */
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {act, render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {useAdminTeachers} from "./useAdminTeachers";

const teacherRow = {
  teacher_id: "t-1",
  teacher_name: "Tobi Teacher",
  email: "tobi@example.com",
  subject: "Mathematics",
  status: "approved",
  programs: ["JSS 1 Mathematics"],
  date_joined: "2026-01-04T10:00:00Z",
};

// A stable array reference, matching real react-query: it caches the
// response and returns the SAME `data` reference across renders until the
// query actually refetches. An inline `() => [teacherRow]` in the mock would
// return a fresh array every call and make this test fail for the wrong
// reason -- exactly the bug under test, but from the mock, not the hook.
const stableData = [teacherRow];

vi.mock("@mcc/features", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mcc/features")>()),
  useTeachers: () => ({data: stableData, isLoading: false, isError: false}),
}));

// Collecting into a plain array (not a ref) -- reading/writing a ref during
// render is itself flagged by the React Compiler-aware lint rule, and would
// muddy a test that's specifically about render-time reference stability.
function Probe({onRender}: {onRender: (teachers: unknown) => void}) {
  const {teachers} = useAdminTeachers();
  onRender(teachers);
  return <span>rendered</span>;
}

describe("useAdminTeachers", () => {
  it("keeps the same teachers array reference when query.data hasn't changed", async () => {
    const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
    const seen: unknown[] = [];
    const {rerender} = render(
      <QueryClientProvider client={client}>
        <Probe onRender={(teachers) => seen.push(teachers)} />
      </QueryClientProvider>,
    );
    await screen.findByText("rendered");

    // Force a second, unrelated render of the same tree -- exactly what any
    // dropdown selection on the real page does to Teachers.tsx and everything
    // under it.
    act(() => {
      rerender(
        <QueryClientProvider client={client}>
          <Probe onRender={(teachers) => seen.push(teachers)} />
        </QueryClientProvider>,
      );
    });

    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen[1]).toBe(seen[0]);
  });
});
