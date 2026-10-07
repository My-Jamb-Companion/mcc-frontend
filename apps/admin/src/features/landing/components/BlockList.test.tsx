// @vitest-environment jsdom
import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen, within} from "@testing-library/react";
import {createBlock} from "@mcc/landing-content";
import BlockList, {SITE_SELECTION} from "./BlockList";

afterEach(cleanup);

const blocks = [createBlock("hero"), createBlock("faq"), {...createBlock("cta"), visible: false}];

function setup(disabled = false) {
  const props = {
    onSelect: vi.fn(), onMove: vi.fn(), onToggle: vi.fn(), onDuplicate: vi.fn(), onRemove: vi.fn(), onAdd: vi.fn(),
  };
  render(<BlockList blocks={blocks} selectedId={blocks[0].id} disabled={disabled} {...props} />);
  return props;
}

const row = (title: string) => screen.getByText(title).closest("li")!;

describe("BlockList", () => {
  it("shows each section with its headline, and marks a hidden one", () => {
    setup();
    expect(within(row("Hero")).getByText("Walk into your exam ready.")).toBeTruthy();
    expect(within(row("Closing banner")).getByText(/Hidden/)).toBeTruthy();
  });

  it("selects, hides, moves and duplicates a section", () => {
    const p = setup();
    fireEvent.click(within(row("FAQ")).getByText("FAQ"));
    expect(p.onSelect).toHaveBeenCalledWith(blocks[1].id);
    fireEvent.click(within(row("FAQ")).getByRole("button", {name: "Hide this section"}));
    expect(p.onToggle).toHaveBeenCalledWith(blocks[1].id);
    fireEvent.click(within(row("FAQ")).getByRole("button", {name: /Move up/}));
    expect(p.onMove).toHaveBeenCalledWith(blocks[1].id, 0);
    fireEvent.click(within(row("FAQ")).getByRole("button", {name: "Duplicate this section"}));
    expect(p.onDuplicate).toHaveBeenCalledWith(blocks[1].id);
  });

  it("can't move the first section up or the last one down", () => {
    setup();
    expect((within(row("Hero")).getByRole("button", {name: /Move up/}) as HTMLButtonElement).disabled).toBe(true);
    expect((within(row("Closing banner")).getByRole("button", {name: /Move down/}) as HTMLButtonElement).disabled).toBe(true);
  });

  it("asks before deleting a section, and only deletes once confirmed", () => {
    const p = setup();
    fireEvent.click(within(row("FAQ")).getByRole("button", {name: "Delete this section"}));
    expect(p.onRemove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", {name: "Keep it"}));
    expect(p.onRemove).not.toHaveBeenCalled();

    fireEvent.click(within(row("FAQ")).getByRole("button", {name: "Delete this section"}));
    fireEvent.click(screen.getByRole("button", {name: "Delete section"}));
    expect(p.onRemove).toHaveBeenCalledWith(blocks[1].id);
  });

  it("adds a section from the gallery", () => {
    const p = setup();
    fireEvent.click(screen.getByRole("button", {name: /Add a section/}));
    fireEvent.click(screen.getByText("Courses"));
    expect(p.onAdd).toHaveBeenCalledWith("courses");
  });

  it("opens the header and footer settings", () => {
    const p = setup();
    fireEvent.click(screen.getByText("Header, footer and search"));
    expect(p.onSelect).toHaveBeenCalledWith(SITE_SELECTION);
  });

  it("locks the controls when read-only", () => {
    setup(true);
    expect((screen.getByRole("button", {name: /Add a section/}) as HTMLButtonElement).disabled).toBe(true);
    expect((within(row("FAQ")).getByRole("button", {name: "Delete this section"}) as HTMLButtonElement).disabled).toBe(true);
    expect(row("FAQ").getAttribute("draggable")).toBe("false");
  });
});
