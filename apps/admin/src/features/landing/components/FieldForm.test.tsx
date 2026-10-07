// @vitest-environment jsdom
import {useState} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen, within} from "@testing-library/react";
import type {Field, FieldData} from "@mcc/landing-content";
import FieldForm from "./FieldForm";

vi.mock("./ImageField", () => ({default: ({label}: {label: string}) => <div>image:{label}</div>}));

afterEach(cleanup);

const fields: Field[] = [
  {kind: "text", key: "headline", label: "Headline"},
  {kind: "url", key: "cta_href", label: "Button link"},
  {kind: "toggle", key: "highlight", label: "Highlight"},
  {kind: "image", key: "photo_url", label: "Photo"},
  {kind: "strings", key: "ticks", label: "Ticks", itemLabel: "Tick"},
  {
    kind: "list", key: "items", label: "Questions", itemLabel: "Question", titleKey: "q",
    fields: [{kind: "text", key: "q", label: "Question"}, {kind: "text", key: "a", label: "Answer"}],
  },
];

/** Holds the data like the editor does, so edits flow back in. */
function Harness({initial, onChange}: {initial: FieldData; onChange?: (d: FieldData) => void}) {
  const [data, setData] = useState(initial);
  return <FieldForm fields={fields} data={data} onChange={(d) => { setData(d); onChange?.(d); }} />;
}

const base: FieldData = {headline: "Hi", cta_href: "/signup", highlight: false, photo_url: "", ticks: ["One", "Two"], items: [{q: "First?", a: "Yes"}, {q: "Second?", a: "No"}]};

describe("FieldForm", () => {
  it("edits a text field and passes the whole record up", () => {
    const seen = vi.fn();
    render(<Harness initial={base} onChange={seen} />);
    fireEvent.change(screen.getByLabelText("Headline"), {target: {value: "Hello"}});
    expect(seen).toHaveBeenLastCalledWith({...base, headline: "Hello"});
  });

  it("flags a link that could run script, and accepts an ordinary one", () => {
    render(<Harness initial={{...base, cta_href: "javascript:alert(1)"}} />);
    expect(screen.getByRole("alert").textContent).toContain("Links must start with");
    fireEvent.change(screen.getByLabelText("Button link"), {target: {value: "https://example.com"}});
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("adds, reorders and removes plain strings", () => {
    const seen = vi.fn();
    render(<Harness initial={base} onChange={seen} />);
    fireEvent.click(screen.getByRole("button", {name: /Add tick/i}));
    expect(seen).toHaveBeenLastCalledWith({...base, ticks: ["One", "Two", ""]});
    fireEvent.click(screen.getAllByRole("button", {name: "Move down"})[0]);
    expect((seen.mock.lastCall![0] as FieldData).ticks).toEqual(["Two", "One", ""]);
    fireEvent.click(screen.getByRole("button", {name: "Remove tick 1"}));
    expect((seen.mock.lastCall![0] as FieldData).ticks).toEqual(["One", ""]);
  });

  it("opens a list item to edit it, and adds a blank one", () => {
    const seen = vi.fn();
    render(<Harness initial={base} onChange={seen} />);
    expect(screen.queryByLabelText("Answer")).toBeNull();
    fireEvent.click(screen.getByRole("button", {name: "First?"}));
    fireEvent.change(screen.getByLabelText("Answer"), {target: {value: "Absolutely"}});
    expect((seen.mock.lastCall![0] as {items: FieldData[]}).items[0]).toEqual({q: "First?", a: "Absolutely"});

    fireEvent.click(screen.getByRole("button", {name: /Add question/i}));
    expect((seen.mock.lastCall![0] as {items: FieldData[]}).items).toHaveLength(3);
    expect((seen.mock.lastCall![0] as {items: FieldData[]}).items[2]).toEqual({q: "", a: ""});
  });

  it("asks before removing a list item, and keeps it if cancelled", () => {
    const seen = vi.fn();
    render(<Harness initial={base} onChange={seen} />);
    const card = screen.getByRole("button", {name: "Second?"}).closest("div")!.parentElement!;
    fireEvent.click(within(card).getByRole("button", {name: "Remove question"}));
    expect(seen).not.toHaveBeenCalled();
    expect(screen.getByText(/will be taken out of the page/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", {name: "Keep it"}));
    expect(seen).not.toHaveBeenCalled();

    fireEvent.click(within(card).getByRole("button", {name: "Remove question"}));
    fireEvent.click(screen.getByRole("button", {name: "Remove"}));
    expect((seen.mock.lastCall![0] as {items: FieldData[]}).items.map((i) => i.q)).toEqual(["First?"]);
  });

  it("disables everything when read-only", () => {
    render(<FieldForm fields={fields} data={base} onChange={() => {}} disabled />);
    expect((screen.getByLabelText("Headline") as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("button", {name: /Add tick/i}) as HTMLButtonElement).disabled).toBe(true);
  });
});
