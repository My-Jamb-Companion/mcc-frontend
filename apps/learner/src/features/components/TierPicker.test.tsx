import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {TierPicker} from "./TierPicker";

afterEach(cleanup);

const tiers = [
  {tier_id: "a", tier_name: "Standard", price: 5000, description: "The standard price for most students"},
  {tier_id: "b", tier_name: "Supported", price: 3500, description: ""},
];

describe("TierPicker", () => {
  it("shows each tier's description and says every tier gets the same course", () => {
    render(<TierPicker tiers={tiers} selectedTierId="a" onSelect={() => {}} />);
    expect(screen.getByText("The standard price for most students")).toBeInTheDocument();
    expect(screen.getByText(/same course and features/i)).toBeInTheDocument();
    expect(screen.getByText(/choose the price that suits you/i)).toBeInTheDocument();
    expect(screen.getByText("₦3,500")).toBeInTheDocument();
  });

  it("shows only the name and price when a tier has no description", () => {
    render(<TierPicker tiers={[tiers[1], {...tiers[0], description: undefined}]} selectedTierId="b" onSelect={() => {}} />);
    expect(screen.getByText("Supported")).toBeInTheDocument();
    expect(screen.queryByText("The standard price for most students")).not.toBeInTheDocument();
  });

  it("doesn't explain tiers when there is only one to take", () => {
    render(<TierPicker tiers={[tiers[0]]} selectedTierId="a" onSelect={() => {}} />);
    expect(screen.queryByText(/same course and features/i)).not.toBeInTheDocument();
  });

  it("says which way of learning the prices are for, and numbers the step", () => {
    render(<TierPicker tiers={tiers} selectedTierId="a" onSelect={() => {}} formatLabel="Live 1-to-1" />);
    expect(screen.getByText("2. Choose your price")).toBeInTheDocument();
    expect(screen.getByText("Prices for Live 1-to-1")).toBeInTheDocument();
  });

  it("is just \"Choose your price\" when there is no choice of ways to learn", () => {
    render(<TierPicker tiers={tiers} selectedTierId="a" onSelect={() => {}} />);
    expect(screen.getByText("Choose your price")).toBeInTheDocument();
    expect(screen.queryByText(/Prices for/)).not.toBeInTheDocument();
  });

  it("reports the tier picked", () => {
    const onSelect = vi.fn();
    render(<TierPicker tiers={tiers} selectedTierId="a" onSelect={onSelect} />);
    fireEvent.click(screen.getByLabelText(/Supported/));
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("renders nothing without tiers", () => {
    const {container} = render(<TierPicker tiers={[]} selectedTierId={null} onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
