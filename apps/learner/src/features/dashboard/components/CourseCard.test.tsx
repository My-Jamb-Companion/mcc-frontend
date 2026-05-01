import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import CourseCard from "./CourseCard";
import React from "react";

// Mocking @mcc/ui Icon component
vi.mock("@mcc/ui", () => ({
  Icon: ({icon}: {icon: string}) => <i data-testid="icon" data-icon={icon} />,
}));

describe("CourseCard", () => {
  const mockProps = {
    image: "test-image.jpg",
    instructor: "John Doe",
    rating: 4.8,
    reviewCount: "1,200",
    title: "Learning React",
    tags: ["React", "Frontend", "JavaScript"],
    onClick: vi.fn(),
  };

  it("renders course details correctly", () => {
    render(<CourseCard {...mockProps} />);

    expect(screen.getByText("Learning React")).toBeDefined();
    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.getByText("4.8")).toBeDefined();
    expect(screen.getByText("(1,200)")).toBeDefined();
    const img = screen.getByAltText("Learning React") as HTMLImageElement;
    expect(img.src).toContain("test-image.jpg");
  });

  it("handles tag visibility and extra tag count", () => {
    render(<CourseCard {...mockProps} />);

    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("Frontend")).toBeDefined();
    // Only the first 2 tags should be rendered individually
    expect(screen.queryByText("JavaScript")).toBeNull();
    // Extra tags count (+1 since there were 3 total)
    expect(screen.getByText("+1")).toBeDefined();
  });

  it("renders pricing information when provided", () => {
    render(
      <CourseCard
        {...mockProps}
        price={5000}
        originalPrice={10000}
        pricePerModule={500}
        currency="₦"
      />,
    );

    expect(screen.getByText("₦5,000")).toBeDefined();
    expect(screen.getByText("₦10,000")).toBeDefined();
    expect(screen.getByText("(₦500 per module)")).toBeDefined();
  });

  it("calls onClick handler when the card is clicked", () => {
    render(<CourseCard {...mockProps} />);

    // The card root div has the onClick
    fireEvent.click(screen.getByText("Learning React").closest(".group")!);
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });
});
