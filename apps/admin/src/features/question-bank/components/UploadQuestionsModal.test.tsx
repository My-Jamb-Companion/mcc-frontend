// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render as rtlRender, screen, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type {ReactElement} from "react";

vi.mock("@mcc/ui", () => ({Icon: () => null, Modal: ({open, children}: {open: boolean; children: React.ReactNode}) => (open ? <div>{children}</div> : null), showError: vi.fn(), showSuccess: vi.fn()}));
const downloadQuestionTemplate = vi.fn();
vi.mock("../services/questionBank.service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/questionBank.service")>()),
  downloadQuestionTemplate: (...args: unknown[]) => downloadQuestionTemplate(...args),
}));
const downloadBlob = vi.fn();
vi.mock("@/src/features/Exam-program/helper/export", () => ({downloadBlob: (...args: unknown[]) => downloadBlob(...args)}));

import UploadQuestionsModal from "./UploadQuestionsModal";

const render = (ui: ReactElement) => rtlRender(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);
const open = (target: React.ComponentProps<typeof UploadQuestionsModal>["target"]) => render(<UploadQuestionsModal open target={target} onClose={() => {}} />);

beforeEach(() => {
  downloadQuestionTemplate.mockReset().mockResolvedValue(new Blob(["x"]));
  downloadBlob.mockReset();
});
afterEach(cleanup);

describe("template downloads", () => {
  it.each([
    ["a practice set", {kind: "set" as const, withResponses: true}, "practice", "maths-practice-template.xlsx"],
    ["an exercise set", {kind: "set" as const, withResponses: false}, "exercise", "maths-exercise-template.xlsx"],
    ["a mock exam", {kind: "set" as const, withResponses: false, withPassages: true}, "mock", "maths-mock-template.xlsx"],
  ])("for %s the maths template is the %s one", async (_label, target, kind, filename) => {
    open(target as never);
    fireEvent.click(screen.getByRole("button", {name: /Maths template/}));
    await waitFor(() => expect(downloadQuestionTemplate).toHaveBeenCalledWith("xlsx", kind, "maths"));
    await waitFor(() => expect(downloadBlob).toHaveBeenCalledWith(expect.anything(), filename));
  });

  it("gives the plain Excel template the columns that fit the set", async () => {
    open({kind: "set", withResponses: true} as never);
    fireEvent.click(screen.getByRole("button", {name: /Excel template/}));
    await waitFor(() => expect(downloadQuestionTemplate).toHaveBeenCalledWith("xlsx", "practice", "general"));
  });

  it("has the general template and no maths one for the Question Bank", async () => {
    open({kind: "bank"});
    expect(screen.queryByRole("button", {name: /Maths template/})).toBeNull();
    fireEvent.click(screen.getByRole("button", {name: /CSV template/}));
    await waitFor(() => expect(downloadQuestionTemplate).toHaveBeenCalledWith("csv", "general", "general"));
    await waitFor(() => expect(downloadBlob).toHaveBeenCalledWith(expect.anything(), "question-template.csv"));
  });
});
