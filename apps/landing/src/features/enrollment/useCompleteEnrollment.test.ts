import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCourseStore } from "@mcc/store";
import { useCompleteEnrollment } from "./useCompleteEnrollment";
import * as enrollmentService from "./enrollment.service";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("./enrollment.service", () => ({
  initializeCoursePayment: vi.fn(),
  registerForExamProgram: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  useCourseStore.setState({ pendingCourse: null });
  delete (window as { location?: unknown }).location;
  (window as unknown as { location: { href: string } }).location = { href: "" };
});

describe("useCompleteEnrollment", () => {
  it("calls initializeCoursePayment for a course, with 'paid' when price > 0", async () => {
    vi.mocked(enrollmentService.initializeCoursePayment).mockResolvedValue({
      enrollment_id: "e1", is_paid: true, checkout_url: "https://checkout.flutterwave.com/x",
    });
    const { result } = renderHook(() => useCompleteEnrollment());

    await act(async () => {
      await result.current.complete({ id: "c1", title: "Course 1", price: 5000, kind: "course" });
    });

    expect(enrollmentService.initializeCoursePayment).toHaveBeenCalledWith("c1", "paid");
  });

  it("calls initializeCoursePayment with 'free' when price is 0", async () => {
    vi.mocked(enrollmentService.initializeCoursePayment).mockResolvedValue({
      enrollment_id: "e1", is_paid: false, redirect_url: "https://x",
    });
    const { result } = renderHook(() => useCompleteEnrollment());

    await act(async () => {
      await result.current.complete({ id: "c1", title: "Course 1", price: 0, kind: "course" });
    });

    expect(enrollmentService.initializeCoursePayment).toHaveBeenCalledWith("c1", "free");
  });

  it("calls registerForExamProgram for an exam-prep program", async () => {
    vi.mocked(enrollmentService.registerForExamProgram).mockResolvedValue({
      access_id: "a1", is_paid: false,
    });
    const { result } = renderHook(() => useCompleteEnrollment());

    await act(async () => {
      await result.current.complete({ id: "p1", title: "Program 1", kind: "exam" });
    });

    expect(enrollmentService.registerForExamProgram).toHaveBeenCalledWith("p1");
    expect(enrollmentService.initializeCoursePayment).not.toHaveBeenCalled();
  });

  it("redirects the browser to checkout_url when the enrolment is paid", async () => {
    vi.mocked(enrollmentService.initializeCoursePayment).mockResolvedValue({
      enrollment_id: "e1", is_paid: true, checkout_url: "https://checkout.flutterwave.com/x",
    });
    const { result } = renderHook(() => useCompleteEnrollment());

    await act(async () => {
      await result.current.complete({ id: "c1", title: "Course 1", price: 5000, kind: "course" });
    });

    expect(window.location.href).toBe("https://checkout.flutterwave.com/x");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigates to /enrolled when the enrolment is free/immediate", async () => {
    vi.mocked(enrollmentService.initializeCoursePayment).mockResolvedValue({
      enrollment_id: "e1", is_paid: false, redirect_url: "https://x",
    });
    const { result } = renderHook(() => useCompleteEnrollment());

    await act(async () => {
      await result.current.complete({ id: "c1", title: "Course 1", price: 0, kind: "course" });
    });

    expect(mockPush).toHaveBeenCalledWith("/enrolled?title=Course%201");
  });

  it("clears the pending course from the store on success", async () => {
    useCourseStore.setState({
      pendingCourse: { id: "c1", title: "Course 1", price: 0, kind: "course" },
    });
    vi.mocked(enrollmentService.initializeCoursePayment).mockResolvedValue({
      enrollment_id: "e1", is_paid: false,
    });
    const { result } = renderHook(() => useCompleteEnrollment());

    await act(async () => {
      await result.current.complete({ id: "c1", title: "Course 1", price: 0, kind: "course" });
    });

    expect(useCourseStore.getState().pendingCourse).toBeNull();
  });

  it("treats an 'already enrolled' 409 as success, not an error", async () => {
    vi.mocked(enrollmentService.initializeCoursePayment).mockRejectedValue({
      response: { data: { message: "You are already actively enrolled in this course" } },
    });
    const { result } = renderHook(() => useCompleteEnrollment());

    await act(async () => {
      await result.current.complete({ id: "c1", title: "Course 1", price: 0, kind: "course" });
    });

    expect(mockPush).toHaveBeenCalledWith("/enrolled?title=Course%201");
    expect(result.current.error).toBeNull();
  });

  it("surfaces a real error message for a genuine failure", async () => {
    vi.mocked(enrollmentService.initializeCoursePayment).mockRejectedValue({
      response: { data: { message: "Course not found" } },
    });
    const { result } = renderHook(() => useCompleteEnrollment());

    await act(async () => {
      await result.current.complete({ id: "c1", title: "Course 1", price: 0, kind: "course" });
    });

    await waitFor(() => expect(result.current.error).toBe("Course not found"));
    expect(mockPush).not.toHaveBeenCalled();
  });
});
