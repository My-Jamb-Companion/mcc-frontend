// @vitest-environment jsdom
/**
 * The "x" beside a lesson used to delete it on the spot, losing whatever the
 * admin had written or uploaded. It must now ask first, in both the course
 * and the exam-program lesson editors.
 */
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import CourseLessons from "./CreateLessons";
import ExamLectures from "@/src/features/Exam-program/components/CreateProgramSteps/LessonsCreate";

vi.mock("@/src/components/LessonHtmlEditor", () => ({default: () => null}));

const files = [
  {id: "a", title: "Intro to Algebra", format: "HTML", size: "", content: "<p>hi</p>"},
  {id: "b", title: "Quadratics", format: "HTML", size: "", content: "<p>yo</p>"},
];

afterEach(cleanup);

describe.each([
  ["course lessons", CourseLessons, "Delete lesson"],
  ["exam lectures", ExamLectures, "Delete lecture"],
])("%s", (_name, Editor, confirmLabel) => {
  it("asks before deleting and keeps the item when cancelled", () => {
    const onFilesChange = vi.fn();
    render(<Editor files={files} onFilesChange={onFilesChange} />);

    fireEvent.click(screen.getByLabelText("Delete Intro to Algebra"));

    expect(onFilesChange).not.toHaveBeenCalled();
    expect(screen.getByText(/Intro to Algebra/, {selector: "strong"})).toBeTruthy();

    fireEvent.click(screen.getByRole("button", {name: "Keep it"}));
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it("removes only the chosen item once confirmed", () => {
    const onFilesChange = vi.fn();
    render(<Editor files={files} onFilesChange={onFilesChange} />);

    fireEvent.click(screen.getByLabelText("Delete Quadratics"));
    fireEvent.click(screen.getByRole("button", {name: confirmLabel}));

    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(onFilesChange.mock.calls[0][0].map((f: {id: string}) => f.id)).toEqual(["a"]);
  });
});
