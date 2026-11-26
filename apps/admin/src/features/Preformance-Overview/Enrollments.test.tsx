// @vitest-environment jsdom
import {cleanup, fireEvent, render, screen, within} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import Enrollments from "./Enrollments";
import {change, matching} from "./enrollmentView";
import type {ApiEnrollmentReport} from "./services/analytics.service";

const useEnrollmentReport = vi.fn();
vi.mock("./hooks/useAnalytics", () => ({useEnrollmentReport: (days: number) => useEnrollmentReport(days)}));

const item = (id: string, title: string, total: number, extra = {}) => ({
  id, title, status: "published", total, paid: 1, free: total - 1, new_in_period: 0, new_in_previous_period: 0, ...extra,
});

const report: ApiEnrollmentReport = {
  days: 30,
  learners: 12,
  paying_learners: 5,
  courses: {
    learners: 10, total: 14, paid: 6, free: 8, new_in_period: 4, new_in_previous_period: 1,
    items: [item("c1", "Algebra", 9, {new_in_period: 4, new_in_previous_period: 1}), item("c2", "Biology", 5, {status: "archived"})],
  },
  exam_programs: {
    learners: 3, total: 3, paid: 3, free: 0, new_in_period: 1, new_in_previous_period: 2,
    items: [item("p1", "JAMB Physics", 3)],
  },
};

beforeEach(() => useEnrollmentReport.mockReturnValue({data: report, isLoading: false, isError: false}));
afterEach(() => {
  cleanup();
  useEnrollmentReport.mockReset();
});

const rowFor = (name: string) => screen.getByText(name).closest("tr")!;

describe("Enrolments", () => {
  it("shows the totals and each course with its paid and free learners", () => {
    render(<Enrollments />);
    expect(screen.getByText("Learners enrolled").parentElement).toHaveTextContent("125 paying");
    expect(screen.getByText("Course enrolments").parentElement).toHaveTextContent("6 paid · 8 free · 10 learners");
    // New across both kinds: 4 + 1 now against 1 + 2 before.
    expect(screen.getByText("New in the last 30 days").parentElement).toHaveTextContent("5+2 on the 30 days before");
    expect(within(rowFor("Algebra")).getAllByRole("cell").map((c) => c.textContent)).toEqual(["Algebra", "9", "1", "8", "4+3"]);
    expect(rowFor("Biology")).toHaveTextContent("archived");
    expect(screen.queryByText("JAMB Physics")).toBeNull();
  });

  it("switches to exam programs and searches the list", () => {
    render(<Enrollments />);
    fireEvent.click(screen.getByRole("button", {name: "Exam programs"}));
    expect(screen.getByText("JAMB Physics")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox"), {target: {value: "chemistry"}});
    expect(screen.queryByText("JAMB Physics")).toBeNull();
    expect(screen.getByText("No exam program matches “chemistry”.")).toBeInTheDocument();
  });

  it("asks for the chosen period", () => {
    render(<Enrollments />);
    expect(useEnrollmentReport).toHaveBeenLastCalledWith(30);
    fireEvent.click(screen.getByRole("button", {name: "7 days"}));
    expect(useEnrollmentReport).toHaveBeenLastCalledWith(7);
  });

  it("says when the figures could not be loaded", () => {
    useEnrollmentReport.mockReturnValue({data: undefined, isLoading: false, isError: true});
    render(<Enrollments />);
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load the enrolment figures");
  });
});

describe("enrollment view helpers", () => {
  it("describes the change between periods", () => {
    expect(change(5, 2)).toEqual({label: "+3", direction: "up"});
    expect(change(1, 4)).toEqual({label: "-3", direction: "down"});
    expect(change(2, 2)).toEqual({label: "no change", direction: "same"});
  });

  it("matches names ignoring case", () => {
    expect(matching(report.courses.items, " alg ").map((i) => i.id)).toEqual(["c1"]);
    expect(matching(report.courses.items, "")).toHaveLength(2);
  });
});
