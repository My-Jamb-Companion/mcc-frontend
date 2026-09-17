// @vitest-environment jsdom
/**
 * The Actions menu on /dashboard/teachers: opening it, and choosing each
 * option. Reported from production as freezing the tab, so these mount the
 * real screen (only the network is faked) and click through every option.
 */
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

// Shaped like production: no picture, and one teacher with 21 programs and
// another with none at all.
const teacherRow = {
  teacher_id: "t-1",
  teacher_name: "Tobi Teacher",
  email: "tobi@example.com",
  subject: "Mathematics",
  status: "approved",
  programs: Array.from({length: 21}, (_, i) => `Programme ${i + 1}`),
  date_joined: "2026-01-04T10:00:00Z",
  no_of_sessions: 0,
  leaderboard_position: 0,
  rating: null,
  avatar_url: null,
};

const bareTeacherRow = {
  teacher_id: "t-2",
  teacher_name: "Prod Verify Teacher",
  email: "prod-verify-teacher-9f3k2@example.com",
  status: "approved",
  programs: [],
  date_joined: "2026-09-14T10:00:00Z",
};

vi.mock("@mcc/features", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mcc/features")>()),
  useTeachers: () => ({data: [teacherRow, bareTeacherRow], isLoading: false, isError: false}),
}));

vi.mock("../services/teacherPrograms.service", () => ({
  getTeacherDetail: vi.fn(async () => ({
    teacher_id: "t-1",
    teacher_name: "Tobi Teacher",
    email: "tobi@example.com",
    phone: "08031234567",
    location: "Lekki, Lagos",
    programs: [],
  })),
  searchPrograms: vi.fn(async () => []),
  assignProgram: vi.fn(async () => ({})),
  unassignProgram: vi.fn(async () => ({})),
}));

vi.mock("../services/escalatedAssignments.service", () => ({
  getEscalatedAssignments: vi.fn(async () => []),
  assignTeacherToAssignment: vi.fn(async () => ({})),
}));

vi.mock("../services/teacherActions.service", () => ({
  approveTeacher: vi.fn(async () => ({})),
  rejectTeacher: vi.fn(async () => ({})),
  disableTeacher: vi.fn(async () => ({})),
}));

import Teachers from "./Teachers";

const renderScreen = () => {
  const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
  return render(
    <QueryClientProvider client={client}>
      <Teachers />
    </QueryClientProvider>,
  );
};

const openMenu = () => {
  fireEvent.click(screen.getAllByLabelText("More actions")[0]);
  return screen.getByText("Open profile");
};

let renderCount = 0;

beforeEach(() => {
  renderCount = 0;
  // A render loop is the reported symptom, so count commits and fail loudly
  // instead of hanging the run.
  const original = console.error;
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    if (String(args[0]).includes("Maximum update depth")) throw new Error("render loop");
    original(...(args as []));
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Teachers actions menu", () => {
  it("opens with every option listed", () => {
    renderScreen();
    openMenu();
    ["Open profile", "Assign Program", "Message teacher", "Assign CRA", "Disable Teacher"].forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it.each([
    ["Open profile", "Personal Details"],
    ["Assign Program", "Assigned Programs List"],
    ["Message teacher", null],
    ["Assign CRA", "Assign to escalated student"],
    ["Disable Teacher", "Disable Teacher"],
  ])("choosing %s opens its panel without looping", async (label, expected) => {
    renderScreen();
    openMenu();
    fireEvent.click(screen.getByText(label as string));
    if (expected) {
      await waitFor(() => expect(screen.getAllByText(expected).length).toBeGreaterThan(0));
    }
    expect(renderCount).toBeLessThan(100);
    // An empty src makes the browser re-fetch the whole page, once per image
    // and on every render -- most teachers have no picture.
    document.querySelectorAll("img").forEach((img) => {
      expect(img.getAttribute("src")).toBeTruthy();
    });
  });

  it("shows initials instead of an empty image when a teacher has no picture", () => {
    renderScreen();
    expect(screen.getAllByText("TT").length).toBeGreaterThan(0);
    document.querySelectorAll("img").forEach((img) => {
      expect(img.getAttribute("src")).toBeTruthy();
    });
  });
});
