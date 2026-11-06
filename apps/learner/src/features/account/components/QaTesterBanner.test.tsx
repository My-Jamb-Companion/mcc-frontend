import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";

vi.mock("@mcc/ui", () => ({Icon: () => null}));
const state = {tester: false};
vi.mock("../hooks/useProfile", () => ({useIsQaTester: () => state.tester}));

import {QaTesterBanner} from "./QaTesterBanner";

afterEach(cleanup);

describe("QaTesterBanner", () => {
  it("is shown on a QA tester account", () => {
    state.tester = true;
    render(<QaTesterBanner />);
    expect(screen.getByRole("status").textContent).toMatch(/QA tester account/);
  });

  it("renders nothing for a real learner", () => {
    state.tester = false;
    const {container} = render(<QaTesterBanner />);
    expect(container.innerHTML).toBe("");
  });
});
