import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TierCards } from "./TierCards";

afterEach(cleanup);

const tiers = [
  { tier_id: "a", tier_name: "Standard", price: "5000", description: "The standard price for most students" },
  { tier_id: "b", tier_name: "Supported", price: "3500", description: "" },
];

describe("TierCards", () => {
  it("shows each tier's description and says every tier gets the same course", () => {
    render(<TierCards groupId="c1" tiers={tiers} value="a" onChange={() => {}} />);
    expect(screen.getByText("The standard price for most students")).toBeInTheDocument();
    expect(screen.getByText(/same course and features/i)).toBeInTheDocument();
    expect(screen.getByText("₦3,500")).toBeInTheDocument();
  });

  it("says which way of learning the prices are for, and numbers the step", () => {
    render(<TierCards groupId="c1" tiers={tiers} value="a" onChange={() => {}} formatLabel="Live 1-to-1" />);
    expect(screen.getByText("2. Choose a price")).toBeInTheDocument();
    expect(screen.getByText("Prices for Live 1-to-1")).toBeInTheDocument();
    expect(screen.getByText(/choose the price that suits you/i)).toBeInTheDocument();
  });

  it("reports the tier picked", () => {
    const onChange = vi.fn();
    render(<TierCards groupId="c1" tiers={tiers} value="a" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText(/Supported/));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("keeps two programs' selections apart", () => {
    render(
      <>
        <TierCards groupId="c1" tiers={tiers} value="a" onChange={() => {}} />
        <TierCards groupId="c2" tiers={tiers} value="b" onChange={() => {}} />
      </>,
    );
    const checked = screen.getAllByRole("radio").filter((r) => (r as HTMLInputElement).checked);
    expect(checked).toHaveLength(2);
  });

  it("renders nothing without tiers", () => {
    const { container } = render(<TierCards groupId="c1" tiers={[]} value={null} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
