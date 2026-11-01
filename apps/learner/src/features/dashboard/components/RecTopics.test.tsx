import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import RecTopics from "./RecTopics";

afterEach(cleanup);

const topics = [
  {category_id: "c1", name: "Finance", course_count: 4},
  {category_id: "c2", name: "Design", course_count: 1},
];

describe("RecTopics", () => {
  it("lists the categories it is given, with how many courses each has", () => {
    render(<RecTopics topics={topics} onSelect={() => {}} />);
    expect(screen.getAllByText("Finance").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4").length).toBeGreaterThan(0);
  });

  it("reports the topic picked and marks the one in use", () => {
    const onSelect = vi.fn();
    render(<RecTopics topics={topics} selectedId="c2" onSelect={onSelect} />);
    fireEvent.click(screen.getAllByRole("button", {name: /Finance/})[0]);
    expect(onSelect).toHaveBeenCalledWith(topics[0]);
    expect(screen.getAllByRole("button", {name: /Design/})[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("shows nothing when there are no topics, rather than invented ones", () => {
    const {container} = render(<RecTopics topics={[]} onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
