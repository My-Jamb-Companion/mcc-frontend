import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";

vi.mock("@mcc/ui", () => ({Icon: () => null}));
vi.mock("./OnboardingRescheduleModal", () => ({OnboardingRescheduleModal: () => null}));

import {AssignmentStatusCard, OUTSIDE_HOURS_TITLE} from "./AssignmentStatusCard";
import type {ApiAssignmentStatus} from "../services/booking.service";

const base: ApiAssignmentStatus = {
  id: "a1",
  purpose: "course",
  target_id: "c1",
  status: "onboarding_scheduled",
  cra_user_id: "cra1",
  cra_is_fallback: false,
  onboarding_meeting_url: "https://zoom.us/j/1",
  onboarding_scheduled_at: "2026-10-09T15:00:00Z",
  teacher_escalated: false,
  is_paid: true,
  live_format: "one_to_one",
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
};

afterEach(cleanup);

describe("AssignmentStatusCard", () => {
  it("shows a plain booked call with no warning when the time is inside coordinator hours", () => {
    render(<AssignmentStatusCard assignment={base} />);
    expect(screen.getByText("Your onboarding call is booked")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Join Zoom call")).toBeTruthy();
  });

  it("warns the learner when the time is outside every coordinator's hours, and keeps the call details", () => {
    render(<AssignmentStatusCard assignment={{...base, cra_is_fallback: true}} />);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain(OUTSIDE_HOURS_TITLE);
    expect(alert.textContent).toContain("may not be free then");
    expect(alert.textContent).toContain("reschedule");
    expect(screen.getByText("Your onboarding call is booked")).toBeTruthy();
    expect(screen.getByText("Reschedule")).toBeTruthy();
  });

  it("says the team will confirm when no coordinator could take the booking, not 'this only takes a moment'", () => {
    render(<AssignmentStatusCard assignment={{...base, status: "cra_escalated", cra_user_id: null}} />);
    expect(screen.getByText(/our team will confirm your call/i)).toBeTruthy();
    expect(screen.getByText(/You asked for/)).toBeTruthy();
    expect(screen.queryByText(/only takes a moment/i)).toBeNull();
  });

  it("still shows the short waiting message while a coordinator is being matched", () => {
    render(<AssignmentStatusCard assignment={{...base, status: "pending_cra"}} />);
    expect(screen.getByText(/only takes a moment/i)).toBeTruthy();
  });

  it("renders nothing once the assignment is active", () => {
    const {container} = render(<AssignmentStatusCard assignment={{...base, status: "active"}} />);
    expect(container.innerHTML).toBe("");
  });
});
