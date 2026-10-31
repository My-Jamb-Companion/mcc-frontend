import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FormatCards } from "./FormatCards";
import type { CatalogueFormat } from "./formats";

afterEach(cleanup);

const tier = (id: string, price: string) => ({ tier_id: id, tier_name: id, price });
const selfPaced: CatalogueFormat = { format: "self_paced", label: "Self-paced", seats: 1, tier_prices: [tier("a", "7000"), tier("b", "11000")] };
const group: CatalogueFormat = { format: "group", label: "Live group", seats: 5, tier_prices: [tier("a", "61000")] };

describe("FormatCards", () => {
  it("lists the three ways to learn, even when only one is on sale", () => {
    render(<FormatCards groupId="c1" formats={[selfPaced]} value="self_paced" onChange={() => {}} />);
    expect(screen.getByText("Self-paced")).toBeInTheDocument();
    expect(screen.getByText("Live group (1 Tutor : 5 students)")).toBeInTheDocument();
    expect(screen.getByText("Live 1-to-1")).toBeInTheDocument();
    expect(screen.getByText("from ₦7,000")).toBeInTheDocument();
  });

  it("marks a way that is not on sale, and will not let it be chosen", () => {
    const onChange = vi.fn();
    render(<FormatCards groupId="c1" formats={[selfPaced]} value="self_paced" onChange={onChange} />);
    expect(screen.getAllByText("Not available yet")).toHaveLength(2);
    const oneToOne = screen.getByLabelText(/Live 1-to-1/) as HTMLInputElement;
    expect(oneToOne.disabled).toBe(true);
    fireEvent.click(oneToOne);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reports the way picked", () => {
    const onChange = vi.fn();
    render(<FormatCards groupId="c1" formats={[selfPaced, group]} value="self_paced" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText(/Live group/));
    expect(onChange).toHaveBeenCalledWith("group");
  });

  it("renders nothing for a program with no published prices", () => {
    const { container } = render(<FormatCards groupId="c1" formats={[]} value={undefined} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
