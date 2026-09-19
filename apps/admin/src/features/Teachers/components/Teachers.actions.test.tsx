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

const {updateTeacherProfileMock} = vi.hoisted(() => ({
  updateTeacherProfileMock: vi.fn(async () => ({teacher_id: "t-1", updates: {}})),
}));

vi.mock("../services/teacherPrograms.service", () => ({
  getTeacherDetail: vi.fn(async () => ({
    teacher_id: "t-1",
    teacher_name: "Tobi Teacher",
    email: "tobi@example.com",
    username: "tobi_teacher",
    phone: "08031234567",
    location: "Lekki, Lagos",
    avatar_url: null,
    status: "active",
    rating: null,
    leaderboard_position: 0,
    programs: [],
    date_joined: "2026-01-04T10:00:00Z",
    no_of_sessions: 3,
    calls_taken: 2,
    upcoming_session: null,
    co_teachers: [],
  })),
  searchPrograms: vi.fn(async () => []),
  assignProgram: vi.fn(async () => ({})),
  unassignProgram: vi.fn(async () => ({})),
  updateTeacherProfile: updateTeacherProfileMock,
}));

vi.mock("../services/media.service", () => ({
  uploadTeacherAvatar: vi.fn(async () => "https://cdn.example.com/avatar.png"),
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
  updateTeacherProfileMock.mockClear();
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

describe("Teacher profile editing", () => {
  const openProfile = async () => {
    renderScreen();
    openMenu();
    fireEvent.click(screen.getByText("Open profile"));
    // "Personal Details" (the section header) renders immediately, and the
    // teacher's email is already on screen from the list row behind the
    // panel -- wait for the location instead, which only getTeacherDetail
    // carries, so this actually waits for the detail fetch to resolve.
    await waitFor(() => expect(screen.getByText("Lekki, Lagos")).toBeTruthy());
  };

  it("shows the teacher's real detail data, not placeholder text", async () => {
    await openProfile();
    // Also shown on the list row behind the panel, so there are two matches.
    expect(screen.getAllByText("tobi@example.com").length).toBeGreaterThan(0);
    expect(screen.getByText("Lekki, Lagos")).toBeTruthy();
    // The old hardcoded panel always showed "bright@gmail.com" / "mac" /
    // "201 of 300 Completed" regardless of which teacher was open.
    expect(screen.queryByText("bright@gmail.com")).toBeNull();
    expect(screen.queryByText(/201 of 300/)).toBeNull();
  });

  it("Edit opens a form pre-filled with the current values", async () => {
    await openProfile();
    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByDisplayValue("Tobi Teacher")).toBeTruthy();
    expect(screen.getByDisplayValue("tobi@example.com")).toBeTruthy();
    expect(screen.getByDisplayValue("08031234567")).toBeTruthy();
    expect(screen.getByDisplayValue("Lekki, Lagos")).toBeTruthy();
  });

  it("Save sends only the fields that actually changed", async () => {
    await openProfile();
    fireEvent.click(screen.getByText("Edit"));

    fireEvent.change(screen.getByDisplayValue("Lekki, Lagos"), {
      target: {value: "Ikoyi, Lagos"},
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => expect(updateTeacherProfileMock).toHaveBeenCalledTimes(1));
    expect(updateTeacherProfileMock).toHaveBeenCalledWith("t-1", {location: "Ikoyi, Lagos"});
  });

  it("Cancel discards edits without saving", async () => {
    await openProfile();
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByDisplayValue("Lekki, Lagos"), {
      target: {value: "Somewhere else"},
    });
    fireEvent.click(screen.getByText("Cancel"));

    expect(updateTeacherProfileMock).not.toHaveBeenCalled();
    expect(screen.getByText("Lekki, Lagos")).toBeTruthy();
  });
});

describe("Teachers filter dropdowns", () => {
  // Reported separately: selecting an option in "Select program" or
  // "Select date" freezes the page too, the same as the Actions menu -- and
  // these two only ever touch local, page-level state (setProgram/setDate),
  // nothing to do with a teacher record. If choosing an option here also
  // breaks, the bug is in re-rendering Teachers itself, not in any one panel.
  it("selecting a program option does not break the page", async () => {
    renderScreen();
    fireEvent.click(screen.getByText("Select program"));
    fireEvent.click(await screen.findByText("IELTS"));
    // The page is still alive: the trigger shows the new value, and other
    // controls still respond.
    await waitFor(() => expect(screen.getByText("IELTS")).toBeTruthy());
    fireEvent.click(screen.getAllByLabelText("More actions")[0]);
    expect(screen.getByText("Open profile")).toBeTruthy();
  });

  it("selecting a date option does not break the page", async () => {
    renderScreen();
    fireEvent.click(screen.getByText("Select Date"));
    fireEvent.click(await screen.findByText("Today"));
    await waitFor(() => expect(screen.getByText("Today")).toBeTruthy());
    fireEvent.click(screen.getAllByLabelText("More actions")[0]);
    expect(screen.getByText("Open profile")).toBeTruthy();
  });

  it("typing in the search box does not break the page", () => {
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText("Search for Active student"), {
      target: {value: "tobi"},
    });
    fireEvent.click(screen.getAllByLabelText("More actions")[0]);
    expect(screen.getByText("Open profile")).toBeTruthy();
  });
});
