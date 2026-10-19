import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ExamReadinessList, predictedText } from "./ExamReadinessList";

afterEach(cleanup);

const predicted = { available: true, low: 62, high: 71, confidence: "low", message: null };

describe("predictedText", () => {
  it("writes a range, one number or nothing", () => {
    expect(predictedText(predicted)).toBe("62% – 71%");
    expect(predictedText({ ...predicted, low: 80, high: 80 })).toBe("80%");
    expect(predictedText({ ...predicted, available: false, low: null, high: null })).toBeNull();
  });
});

describe("ExamReadinessList", () => {
  it("shows each program's readiness and what the practice suggests, called an estimate", () => {
    render(
      <ExamReadinessList
        childName="Ada"
        programs={[
          { program_id: "p1", exam_name: "JAMB", subject_name: "Maths", readiness_percent: 43, answered: 40, predicted },
          { program_id: "p2", exam_name: "WAEC", subject_name: "English", readiness_percent: 0, answered: 0,
            predicted: { available: false, low: null, high: null, confidence: null, message: "Answer 15 more questions to see a predicted score." } },
        ]}
      />,
    );
    expect(screen.getByText("43% ready")).toBeInTheDocument();
    expect(screen.getByText(/Ada's practice so far suggests a score of 62% – 71%.*estimate/)).toBeInTheDocument();
    expect(screen.getByText("Answer 15 more questions to see a predicted score.")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "JAMB — Maths readiness" })).toHaveAttribute("aria-valuenow", "43");
  });
});
