import {afterEach, describe, expect, it} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";
import {WhatYouGet} from "./WhatYouGet";
import type {ApiFormatOffer} from "@/src/features/courses/helper/liveFormats";

afterEach(cleanup);

const group: ApiFormatOffer = {format: "group", label: "Live group", seats: 5, live_sessions: 10, hours_per_session: 1, duration_weeks: 8, tier_prices: []};

describe("WhatYouGet", () => {
  it("shows the weeks and live sessions of the chosen way, then the benefits", () => {
    render(<WhatYouGet kind="exam" formats={[group]} format="group" />);
    expect(screen.getByText("8 weeks")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Unlimited practice, Smart Zone and mock exams")).toBeInTheDocument();
    expect(screen.getByText(/Brainy/)).toBeInTheDocument();
  });

  it("still lists the benefits for a program with no published format", () => {
    render(<WhatYouGet kind="course" formats={[]} format={null} />);
    expect(screen.queryByText("Duration")).not.toBeInTheDocument();
    expect(screen.getByText("Unlimited study sets and flashcards")).toBeInTheDocument();
  });
});
