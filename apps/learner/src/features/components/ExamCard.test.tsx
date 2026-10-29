import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";

vi.mock("@mcc/ui", () => ({Icon: () => null}));
vi.mock("next/link", () => ({default: ({children, href}: {children: React.ReactNode; href: string}) => <a href={href}>{children}</a>}));

import ExamCard from "./ExamCard";

afterEach(cleanup);

describe("ExamCard", () => {
  it("shows the program's cover image as a thumbnail", () => {
    render(<ExamCard exam={{id: "p", name: "JAMB UTME Exam — Use of English", imageUrl: "https://cdn/c.png", completePercent: 16}} />);
    expect(screen.getByRole("img", {name: "JAMB UTME Exam — Use of English"}).getAttribute("src")).toBe("https://cdn/c.png");
  });

  it("has no thumbnail when there is no image, and still shows its details", () => {
    render(<ExamCard exam={{id: "p", name: "JAMB", price: 100, currency: "₦"}} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("Enroll Now")).toBeTruthy();
  });
});
