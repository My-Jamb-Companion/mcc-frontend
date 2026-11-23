// @vitest-environment jsdom
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import MoveButtons, {moveItem} from "./MoveButtons";

afterEach(cleanup);

describe("moveItem", () => {
  it("moves an item up and down without changing the original list", () => {
    const list = ["a", "b", "c"];
    expect(moveItem(list, 2, 1)).toEqual(["a", "c", "b"]);
    expect(moveItem(list, 0, 1)).toEqual(["b", "a", "c"]);
    expect(list).toEqual(["a", "b", "c"]);
  });

  it("stops at the ends and ignores a bad position", () => {
    const list = ["a", "b", "c"];
    expect(moveItem(list, 0, -1)).toBe(list);
    expect(moveItem(list, 2, 3)).toEqual(list);
    expect(moveItem(list, 5, 0)).toBe(list);
  });
});

describe("MoveButtons", () => {
  it("asks for the position above or below", () => {
    const onMove = vi.fn();
    render(<MoveButtons index={1} count={3} onMove={onMove} label="Lesson 2" />);
    fireEvent.click(screen.getByRole("button", {name: "Move Lesson 2 up"}));
    fireEvent.click(screen.getByRole("button", {name: "Move Lesson 2 down"}));
    expect(onMove.mock.calls).toEqual([[0], [2]]);
  });

  it("cannot move the first item up or the last item down", () => {
    const {rerender} = render(<MoveButtons index={0} count={3} onMove={() => {}} label="x" />);
    expect(screen.getByRole("button", {name: "Move x up"})).toBeDisabled();
    expect(screen.getByRole("button", {name: "Move x down"})).toBeEnabled();
    rerender(<MoveButtons index={2} count={3} onMove={() => {}} label="x" />);
    expect(screen.getByRole("button", {name: "Move x down"})).toBeDisabled();
  });

  it("is switched off as a whole while the row is busy, and a lone item has nowhere to go", () => {
    const {rerender} = render(<MoveButtons index={1} count={3} onMove={() => {}} label="x" disabled />);
    expect(screen.getByRole("button", {name: "Move x up"})).toBeDisabled();
    expect(screen.getByRole("button", {name: "Move x down"})).toBeDisabled();
    rerender(<MoveButtons index={0} count={1} onMove={() => {}} label="x" />);
    expect(screen.getByRole("button", {name: "Move x up"})).toBeDisabled();
    expect(screen.getByRole("button", {name: "Move x down"})).toBeDisabled();
  });
});
