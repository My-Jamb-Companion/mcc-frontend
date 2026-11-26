import {describe, expect, it} from "vitest";
import {enrollmentCsv, enrollmentCsvName} from "./enrollmentCsv";
import type {ApiEnrollmentReport} from "./services/analytics.service";

const item = (title: string, status = "published") => ({
  id: title, title, status, total: 3, paid: 2, free: 1, new_in_period: 1, new_in_previous_period: 0,
});
const group = (items: ReturnType<typeof item>[]) => ({
  learners: 0, total: 0, paid: 0, free: 0, new_in_period: 0, new_in_previous_period: 0, items,
});
const report = (courses: string[], programs: string[]): ApiEnrollmentReport => ({
  days: 30, learners: 0, paying_learners: 0,
  courses: group(courses.map((c) => item(c))),
  exam_programs: group(programs.map((p) => item(p, "archived"))),
});

const lines = (csv: string) => csv.replace(/^﻿/, "").trimEnd().split("\r\n");

describe("enrollmentCsv", () => {
  it("lists courses then exam programs under a header that names the period", () => {
    const csv = enrollmentCsv(report(["Algebra"], ["JAMB Physics"]));
    expect(csv.startsWith("﻿")).toBe(true);
    expect(lines(csv)).toEqual([
      "Type,Name,Status,Learners,Paid,Free,New (last 30 days),New (previous 30 days)",
      "Course,Algebra,published,3,2,1,1,0",
      "Exam program,JAMB Physics,archived,3,2,1,1,0",
    ]);
  });

  it("quotes names with commas or quotes", () => {
    const [, row] = lines(enrollmentCsv(report(['Maths, "Part 1"'], [])));
    expect(row.startsWith('Course,"Maths, ""Part 1""",published')).toBe(true);
  });

  it("never lets a name be read as a formula", () => {
    for (const name of ["=1+1", "+SUM(A1)", "-2", "@cmd"]) {
      const [, row] = lines(enrollmentCsv(report([name], [])));
      expect(row.split(",")[1]).toBe(`'${name}`);
    }
  });

  it("names the file by date and period", () => {
    expect(enrollmentCsvName(90, new Date("2026-11-26T10:00:00Z"))).toBe("enrolments-2026-11-26-last-90-days.csv");
  });
});
