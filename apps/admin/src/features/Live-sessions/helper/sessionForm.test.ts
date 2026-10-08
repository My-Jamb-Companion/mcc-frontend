import {describe, expect, it} from "vitest";
import {DURATION_DAYS, chartRows, emptySessionForm, minDateTimeLocal, toCreateInput, validateSession} from "./sessionForm";

const now = new Date("2026-10-08T10:00:00");
const teacher = {teacher_id: "t1", teacher_name: "Ada", subject: null, email: "a@x.com"};
const program = {program_id: "p1", program_name: "Maths", program_type: "exam" as const, teacher_id: null};
const good = {...emptySessionForm(), title: " Algebra ", teacher, scheduledAt: "2026-10-09T09:30"};

describe("session form", () => {
  it("never offers a window the server would refuse", () => {
    expect(Math.max(...Object.values(DURATION_DAYS))).toBeLessThanOrEqual(365);
    expect(DURATION_DAYS["all time"]).toBeUndefined();
  });

  it("accepts a complete form", () => {
    expect(validateSession(good, now)).toEqual({});
  });

  it("explains what is missing or wrong", () => {
    const errors = validateSession({...emptySessionForm(), duration: "0", price: "-1", meetingUrl: "zoom.us/j/1"}, now);
    expect(Object.keys(errors).sort()).toEqual(["duration", "meetingUrl", "price", "scheduledAt", "teacher", "title"]);
  });

  it("refuses a class in the past", () => {
    expect(validateSession({...good, scheduledAt: "2026-10-08T09:00"}, now).scheduledAt).toMatch(/future/);
  });

  it("builds the request: trimmed title, ISO time, program as id and type", () => {
    const input = toCreateInput({...good, program, duration: "90", price: "2500", meetingUrl: " https://zoom.us/j/1 "});
    expect(input).toMatchObject({
      title: "Algebra", teacher_id: "t1", program_type: "exam", program_id: "p1",
      duration_minutes: 90, price: 2500, meeting_url: "https://zoom.us/j/1",
    });
    expect(input.scheduled_at).toBe(new Date("2026-10-09T09:30").toISOString());
  });

  it("leaves out the optional parts when empty", () => {
    const input = toCreateInput(good);
    expect("program_id" in input || "meeting_url" in input).toBe(false);
  });

  it("formats the earliest bookable time for a datetime-local input", () => {
    expect(minDateTimeLocal(new Date(2026, 9, 8, 9, 5))).toBe("2026-10-08T09:05");
  });

  it("turns summary days into numbers for the chart", () => {
    expect(chartRows([{date: "2026-10-01", calls: 3, revenue: "1500.00"}])).toEqual([{day: "1 Oct", calls: 3, revenue: 1500}]);
  });

  it("fills the days with no calls across the whole window, oldest first", () => {
    const rows = chartRows([{date: "2026-10-06", calls: 2, revenue: "0.00"}], 4, new Date(2026, 9, 8, 15));
    expect(rows.map((r) => [r.day, r.calls])).toEqual([["5 Oct", 0], ["6 Oct", 2], ["7 Oct", 0], ["8 Oct", 0]]);
  });
});
