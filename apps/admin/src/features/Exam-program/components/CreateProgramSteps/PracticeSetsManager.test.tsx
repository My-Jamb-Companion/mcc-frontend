// @vitest-environment jsdom
import {afterEach, describe, expect, it, vi} from "vitest";
import {useState} from "react";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import PracticeSetsManager from "./PracticeSetsManager";
import type {PracticeSet} from "@/src/features/Exam-program/helper/practiceSets";

const errors = vi.hoisted(() => ({show: vi.fn()}));
vi.mock("@mcc/ui", async (orig) => ({...(await orig<typeof import("@mcc/ui")>()), showError: (m: string) => errors.show(m)}));
// The question editor is its own thing, tested elsewhere; here it is only a marker of which set is open.
vi.mock("./PracticeQuestions", () => ({
  default: ({questions}: {questions: unknown[]}) => <div data-testid="editor">{questions.length} questions</div>,
}));

afterEach(() => {
  cleanup();
  errors.show.mockReset();
});

const q = (id: string) => ({id, type: "single" as const, question: id, options: []});
const sets = (): PracticeSet[] => [
  {id: "a", name: "", questions: [q("1"), q("2")]},
  {id: "b", name: "Passage practice", questions: [q("3")]},
];

/** Holds the sets the way the editor does, and reports each change. */
function Harness({initial, onChange}: {initial: PracticeSet[]; onChange: (sets: PracticeSet[]) => void}) {
  const [current, setCurrent] = useState(initial);
  return <PracticeSetsManager sets={current} onChange={(next) => { setCurrent(next); onChange(next); }} />;
}

describe("PracticeSetsManager", () => {
  it("shows each set as a tab with its question count, the default one called Practice", () => {
    render(<PracticeSetsManager sets={sets()} onChange={vi.fn()} />);
    expect(screen.getByRole("tab", {name: /^Practice\s*\(2\)$/})).toBeInTheDocument();
    expect(screen.getByRole("tab", {name: /^Passage practice\s*\(1\)$/})).toBeInTheDocument();
  });

  it("opens the first set, and another when its tab is chosen", () => {
    render(<PracticeSetsManager sets={sets()} onChange={vi.fn()} />);
    expect(screen.getByTestId("editor")).toHaveTextContent("2 questions");
    fireEvent.click(screen.getByRole("tab", {name: /Passage practice/}));
    expect(screen.getByTestId("editor")).toHaveTextContent("1 questions");
  });

  it("adds a practice with a name no other has, and opens it", () => {
    const onChange = vi.fn();
    render(<Harness initial={sets()} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", {name: "Add practice"}));
    const next = onChange.mock.calls[0][0] as PracticeSet[];
    expect(next).toHaveLength(3);
    expect(next[2]).toMatchObject({name: "Practice 2", questions: []});
    expect(screen.getByRole("textbox", {name: "Practice name"})).toBeInTheDocument();
  });

  it("renames a set", () => {
    const onChange = vi.fn();
    render(<PracticeSetsManager sets={sets()} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", {name: "Rename Passage practice"}));
    const input = screen.getByRole("textbox", {name: "Practice name"});
    fireEvent.change(input, {target: {value: "Comprehension drills"}});
    fireEvent.keyDown(input, {key: "Enter"});
    expect(onChange).toHaveBeenCalledWith([sets()[0], {...sets()[1], name: "Comprehension drills"}].map((s) => expect.objectContaining({id: s.id, name: s.name})));
  });

  it("refuses a name another set already has", () => {
    const onChange = vi.fn();
    render(<PracticeSetsManager sets={sets()} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", {name: "Rename Passage practice"}));
    const input = screen.getByRole("textbox", {name: "Practice name"});
    fireEvent.change(input, {target: {value: "practice"}});
    fireEvent.keyDown(input, {key: "Enter"});
    expect(onChange).not.toHaveBeenCalled();
    expect(errors.show).toHaveBeenCalledWith(expect.stringContaining("already called"));
  });

  it("deletes an empty set at once, and asks before deleting one with questions", () => {
    const onChange = vi.fn();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const withEmpty = [...sets(), {id: "c", name: "Empty", questions: []}];
    render(<PracticeSetsManager sets={withEmpty} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", {name: "Delete Empty"}));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(confirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", {name: "Delete Practice"}));
    expect(confirm).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(1); // declined: nothing deleted
    confirm.mockRestore();
  });

  it("says so when there are no practices yet", () => {
    render(<PracticeSetsManager sets={[]} onChange={vi.fn()} />);
    expect(screen.getByText(/No practices yet/)).toBeInTheDocument();
    expect(screen.queryByTestId("editor")).toBeNull();
  });
});
