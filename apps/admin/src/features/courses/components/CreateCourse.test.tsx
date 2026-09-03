// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreateCourseForm from "./CreateCourse";
import * as courseService from "../services/course.service";

// --- Mock next/navigation ---
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

// --- Mock @mcc/ui ---
vi.mock("@mcc/ui", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: new Proxy(
    {},
    {
      get(_target, tag) {
        return ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => {
          const {
            initial: _initial, animate: _animate, exit: _exit, transition: _transition,
            layout: _layout, layoutId: _layoutId, whileHover: _whileHover, whileTap: _whileTap,
            ...rest
          } = props;
          return React.createElement(String(tag) as any, rest as any, children);
        };
      },
    },
  ),
  Button: ({ children, onClick, disabled, loading, type, className }: any) => (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? "Loading..." : children}
    </button>
  ),
  Icon: ({ icon, className }: any) => <span className={className} data-testid={`icon-${icon}`} />,
  showSuccess: vi.fn(),
  showError: vi.fn(),
  confettiCelebrate: vi.fn(),
}));

// --- Mock @mcc/features hooks ---
vi.mock("@mcc/features", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mcc/features")>();
  return {
    ...actual,
    useTeachers: () => ({
      data: [
        { teacher_id: "teacher-1", name: "John Doe", email: "john@example.com" }
      ],
      isLoading: false,
    }),
  };
});

// --- Mock course hooks ---
vi.mock("../hooks/useCourse", () => ({
  useCourseData: () => ({
    saveDraft: vi.fn().mockImplementation((data) => data),
    publish: vi.fn().mockImplementation((data) => data),
  }),
}));

// --- Mock course.service APIs ---
vi.mock("../services/course.service", () => ({
  createCourseDetails: vi.fn(),
  updateCourse: vi.fn(),
  publishCourse: vi.fn(),
  unpublishCourse: vi.fn(),
}));

const mockCreateCourseDetails = vi.mocked(courseService.createCourseDetails);

// --- Providers wrapper ---
function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe("CreateCourseForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Step 1 (Details) and fails validation when required fields are empty", async () => {
    userEvent.setup();
    render(<CreateCourseForm />, { wrapper: Providers });

    // Expect form title
    expect(screen.getByText("Create course")).toBeInTheDocument();

    // Fill in partial/empty and trigger validation (Save & continue)
    const nextBtn = screen.getByRole("button", { name: /Save & continue/i });
    expect(nextBtn).toBeDisabled();
  });

  it("submits Step 1 details and moves to Step 2 when fields are valid", async () => {
    mockCreateCourseDetails.mockResolvedValue({
      id: "course-backend-123",
      title: "Introduction to Biology",
      category: "science",
      teacher_id: "teacher-1",
      price: 99,
      level: "beginner",
      description: "This is a detailed course description for biology that exceeds twenty characters.",
      learning_outcomes: ["Understand cells", "Learn mitosis"],
      tags: ["biology", "science"],
    });

    const user = userEvent.setup();
    render(<CreateCourseForm />, { wrapper: Providers });

    // Fill in Name
    const nameInput = screen.getByPlaceholderText(/Course name/i);
    await user.type(nameInput, "Introduction to Biology");

    // Select Category
    const categoryBtn = screen.getByRole("button", { name: /Select category/i });
    await user.click(categoryBtn);
    const categoryOption = screen.getByText("Science");
    await user.click(categoryOption);

    // Select Instructor
    const instructorBtn = screen.getByRole("button", { name: /Select instructor/i });
    await user.click(instructorBtn);
    const instructorOption = screen.getByText("John Doe");
    await user.click(instructorOption);

    // Fill Price
    const priceInput = screen.getByLabelText(/Price/i);
    await user.type(priceInput, "99");

    // Select Level (Beginner button)
    const beginnerBtn = screen.getByRole("button", { name: /Beginner/i });
    await user.click(beginnerBtn);

    // Fill Description
    const descInput = screen.getByLabelText(/Description/i);
    await user.type(descInput, "This is a detailed course description for biology that exceeds twenty characters.");

    // Add learning outcomes
    const outcomesContainer = screen.getByText(/What will students learn\?/i).closest("div");
    const outcomesInput = outcomesContainer!.querySelector("input")!;
    await user.type(outcomesInput, "Understand cells{Enter}");

    // Add tags
    const tagsContainer = screen.getByText("Tags").closest("div");
    const tagsInput = tagsContainer!.querySelector("input")!;
    await user.type(tagsInput, "biology{Enter}");

    // Wait for form to become valid and Click Save & Continue
    const nextBtn = screen.getByRole("button", { name: /Save & continue/i });
    await waitFor(() => {
      expect(nextBtn).not.toBeDisabled();
    });
    await user.click(nextBtn);

    // Verify mock API was called
    await waitFor(() => {
      expect(mockCreateCourseDetails).toHaveBeenCalledWith({
        title: "Introduction to Biology",
        category: "science",
        teacher_id: "teacher-1",
        price: 99,
        level: "beginner",
        description: "This is a detailed course description for biology that exceeds twenty characters.",
        learning_outcomes: ["Understand cells"],
        tags: ["biology"],
      });
    });

    // Verify navigation/step update -> Check for Content step elements
    await waitFor(() => {
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });
});
