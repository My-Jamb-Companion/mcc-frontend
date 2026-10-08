import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";

const showSuccess = vi.fn();
const showError = vi.fn();

vi.mock("@mcc/ui", () => ({Icon: () => null, showSuccess: (m: string) => showSuccess(m), showError: (m: string) => showError(m)}));
vi.mock("@/src/features/courses/hooks/useCourses", () => ({
  useCertificates: () => ({
    isLoading: false,
    certificates: [{id: "c1", course_id: "k1", course_title: "Algebra Basics", cover_image_url: null, issued_at: "2026-10-01T10:00:00Z"}],
  }),
}));

import CertificateCard from "./CertificateCard";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  Reflect.deleteProperty(navigator, "share");
});

describe("Certificate Share", () => {
  it("opens the share sheet when the device has one", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {value: share, configurable: true});
    render(<CertificateCard />);
    fireEvent.click(screen.getByRole("button", {name: /Share/}));
    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(share.mock.calls[0][0].text).toContain("Algebra Basics");
  });

  it("copies the message when there is no share sheet", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {value: {writeText}, configurable: true});
    render(<CertificateCard />);
    fireEvent.click(screen.getByRole("button", {name: /Share/}));
    await waitFor(() => expect(showSuccess).toHaveBeenCalled());
    expect(writeText.mock.calls[0][0]).toContain("Algebra Basics");
  });

  it("is quiet when the student just closes the share sheet", async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error("closed"), {name: "AbortError"}));
    Object.defineProperty(navigator, "share", {value: share, configurable: true});
    render(<CertificateCard />);
    fireEvent.click(screen.getByRole("button", {name: /Share/}));
    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(showError).not.toHaveBeenCalled();
  });
});
