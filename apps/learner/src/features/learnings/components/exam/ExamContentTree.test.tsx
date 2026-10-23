import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import type {ApiExamTopic} from "@/src/features/exams/services/exam.service";
import ExamContentTree, {ActiveNode} from "./ExamContentTree";

vi.mock("@/src/features/bookmarks/BookmarkButton", () => ({default: () => null}));
vi.mock("../DownloadButton", () => ({default: () => null}));

afterEach(cleanup);

const tree = (module: Record<string, unknown>): ApiExamTopic[] => [{
  topic_id: "t", title: "Topic", order_index: 0,
  sub_topics: [{sub_topic_id: "s", title: "Sub", description: null, order_index: 0, exercise_count: 0, test_count: 0, modules: [
    {module_id: "m", title: "Comprehension", order_index: 0, lectures: [], exercise_count: 0, quiz_count: 0, practice_count: 0, ...module},
  ]}],
}] as unknown as ApiExamTopic[];

function open(topics: ApiExamTopic[], active: ActiveNode | null = null) {
  const onSelect = vi.fn();
  render(<ExamContentTree topics={topics} active={active} completedLectureIds={new Set()} onSelect={onSelect} />);
  fireEvent.click(screen.getByRole("button", {name: "Sub"}));
  fireEvent.click(screen.getByRole("button", {name: "Comprehension"}));
  return onSelect;
}

describe("a module's Practice in the content tree", () => {
  it("is one row, played as a whole, when the module has a single Practice", () => {
    const onSelect = open(tree({practice_count: 6, practice_sets: [{name: "Practice", count: 6}]}));
    fireEvent.click(screen.getByRole("button", {name: "Practice (6)"}));
    expect(onSelect).toHaveBeenCalledWith({kind: "practice", moduleId: "m", setName: undefined});
  });

  it("is one row per set when there are several, each playing its own set", () => {
    const onSelect = open(tree({practice_count: 9, practice_sets: [
      {name: "Practice", count: 2}, {name: "Passage practice", count: 5}, {name: "Vocabulary", count: 2},
    ]}));
    expect(screen.getByRole("button", {name: "Practice (2)"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Vocabulary (2)"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Passage practice (5)"}));
    expect(onSelect).toHaveBeenCalledWith({kind: "practice", moduleId: "m", setName: "Passage practice"});
  });

  it("marks the set being played, not its neighbours", () => {
    open(tree({practice_count: 7, practice_sets: [{name: "Practice", count: 2}, {name: "Passage practice", count: 5}]}),
      {kind: "practice", moduleId: "m", setName: "Passage practice"});
    expect(screen.getByRole("button", {name: "Passage practice (5)"}).className).toMatch(/bg-primary\/5/);
    expect(screen.getByRole("button", {name: "Practice (2)"}).className).not.toMatch(/bg-primary\/5/);
  });

  it("shows nothing for a module with no practice", () => {
    open(tree({practice_count: 0, practice_sets: []}));
    expect(screen.queryByRole("button", {name: /Practice/})).toBeNull();
  });

  it("works against a server that lists no sets", () => {
    open(tree({practice_count: 4}));
    expect(screen.getByRole("button", {name: "Practice (4)"})).toBeInTheDocument();
  });
});
