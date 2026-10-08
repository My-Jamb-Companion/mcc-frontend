// @vitest-environment jsdom
import {useState} from "react";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {Modal} from "./Modal";

afterEach(cleanup);

function Controlled({onClose}: {onClose: () => void}) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Modal open={open} title="Hello" x onClose={() => { onClose(); setOpen(false); }}>body</Modal>
      <button onClick={() => setOpen(false)}>parent closes it</button>
    </>
  );
}

describe("a controlled Modal", () => {
  it("closes on Escape and tells the parent exactly once", () => {
    const onClose = vi.fn();
    render(<Controlled onClose={onClose} />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(document, {key: "Escape"});
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes from the X", () => {
    const onClose = vi.fn();
    render(<Controlled onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("still tells the parent when the parent closes it itself", () => {
    const onClose = vi.fn();
    const {rerender} = render(<Modal open title="Hi" onClose={onClose}>body</Modal>);
    expect(onClose).not.toHaveBeenCalled();
    rerender(<Modal open={false} title="Hi" onClose={onClose}>body</Modal>);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("asks a parent that gave no onClose nothing and stays open", () => {
    render(<Modal open title="Hi">body</Modal>);
    fireEvent.keyDown(document, {key: "Escape"});
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});
