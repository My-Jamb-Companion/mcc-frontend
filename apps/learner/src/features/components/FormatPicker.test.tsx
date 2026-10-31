import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {FormatPicker} from "./FormatPicker";
import type {ApiFormatOffer} from "@/src/features/courses/helper/liveFormats";

afterEach(cleanup);

const tier = (id: string, price: number) => ({tier_id: id, tier_name: id, price});
const selfPaced: ApiFormatOffer = {format: "self_paced", label: "Self-paced", seats: 1, tier_prices: [tier("a", 7000), tier("b", 11000)]};
const group: ApiFormatOffer = {format: "group", label: "Live group (1 teacher : 5 students)", seats: 5, tier_prices: [tier("a", 61000), tier("b", 70000)]};

describe("FormatPicker", () => {
  it("always lists the three ways to learn, named for the buyer, even when only one is on sale", () => {
    render(<FormatPicker formats={[selfPaced]} selected="self_paced" onSelect={() => {}} />);
    expect(screen.getByText("Self-paced")).toBeInTheDocument();
    expect(screen.getByText("Live group (1 Tutor : 5 students)")).toBeInTheDocument();
    expect(screen.getByText("Live 1-to-1")).toBeInTheDocument();
    expect(screen.queryByText(/1 teacher/)).not.toBeInTheDocument();
  });

  it("shows the default tier's price of each way that is on sale", () => {
    render(<FormatPicker formats={[selfPaced, group]} selected="self_paced" tierId="b" onSelect={() => {}} />);
    expect(screen.getByText("₦11,000")).toBeInTheDocument();
    expect(screen.getByText("₦70,000")).toBeInTheDocument();
  });

  it("marks a way that is not on sale, and will not let it be chosen", () => {
    const onSelect = vi.fn();
    render(<FormatPicker formats={[selfPaced]} selected="self_paced" onSelect={onSelect} />);
    expect(screen.getAllByText("Not available yet")).toHaveLength(2);
    const oneToOne = screen.getByLabelText(/Live 1-to-1/) as HTMLInputElement;
    expect(oneToOne.disabled).toBe(true);
    fireEvent.click(oneToOne);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("reports the way picked when it is on sale", () => {
    const onSelect = vi.fn();
    render(<FormatPicker formats={[selfPaced, group]} selected="self_paced" onSelect={onSelect} />);
    fireEvent.click(screen.getByLabelText(/Live group/));
    expect(onSelect).toHaveBeenCalledWith("group");
  });

  it("a way whose list of prices is empty counts as not on sale", () => {
    render(<FormatPicker formats={[selfPaced, {...group, tier_prices: []}]} selected="self_paced" onSelect={() => {}} />);
    expect(screen.getAllByText("Not available yet")).toHaveLength(2);
  });

  it("renders nothing for a program with no published prices: its flat price is the only option", () => {
    const {container} = render(<FormatPicker formats={[]} selected={null} onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
