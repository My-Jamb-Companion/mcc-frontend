import type {ApiEnrollmentItem, ApiEnrollmentReport} from "./services/analytics.service";

/**
 * One value as a CSV cell. A name that starts like a formula (=, +, -, @) is prefixed with an apostrophe, so a
 * spreadsheet shows it as text and never runs it.
 */
function cell(value: string | number): string {
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Every course and exam program with its enrollment figures, ready for a spreadsheet. Starts with a byte-order mark
 * so Excel reads accented names correctly.
 */
export function enrollmentCsv(report: ApiEnrollmentReport): string {
  const header = [
    "Type", "Name", "Status", "Learners", "Paid", "Free",
    `New (last ${report.days} days)`, `New (previous ${report.days} days)`,
  ];
  const rows = (type: string, items: ApiEnrollmentItem[]) =>
    items.map((i) => [type, i.title, i.status, i.total, i.paid, i.free, i.new_in_period, i.new_in_previous_period]);
  const all = [header, ...rows("Course", report.courses.items), ...rows("Exam program", report.exam_programs.items)];
  return "﻿" + all.map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}

export function enrollmentCsvName(days: number, today: Date = new Date()): string {
  return `enrolments-${today.toISOString().slice(0, 10)}-last-${days}-days.csv`;
}
