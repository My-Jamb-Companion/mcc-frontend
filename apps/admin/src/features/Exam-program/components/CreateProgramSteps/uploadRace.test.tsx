// @vitest-environment jsdom
/**
 * Same guarantee as the course editor: a lecture upload that finishes after the admin has moved
 * away from the module's Lectures view must only fill in its own lecture's file address, not
 * restore the module as it looked when they left.
 */
import {act, cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {FormProvider, useForm} from "@mcc/features";
import ContentStep from "./Step2";
import type {ContentFormValues, Topic} from "./Step2";

vi.mock("@/src/components/LessonHtmlEditor", () => ({default: () => null}));

const pending: {resolve: (url: string) => void}[] = [];
vi.mock("@/src/features/courses/services/media.service", () => ({
  uploadMedia: vi.fn(() => new Promise<string>((resolve) => pending.push({resolve}))),
}));

const topics: Topic[] = [
  {
    id: "t1",
    label: "Topic",
    subTopics: [
      {
        id: "s1",
        label: "Sub-topic",
        modules: [
          {
            id: "m1",
            label: "Module",
            leaves: [
              {id: "l1", label: "Lectures", type: "lectures", count: 0},
              {id: "l2", label: "Practice", type: "practice", count: 0},
            ],
          },
        ],
      },
    ],
  },
];

let latest: Topic[] = [];
function Harness() {
  const methods = useForm<ContentFormValues>({defaultValues: {content: {topics}}});
  latest = methods.watch("content.topics");
  return (
    <QueryClientProvider client={new QueryClient()}>
      <FormProvider {...methods}>
        <ContentStep exam="JAMB" subject="Maths" programId="p1" />
      </FormProvider>
    </QueryClientProvider>
  );
}

const lectureTitles = () => (latest[0].subTopics[0].modules[0].leaves[0].lessons ?? []).map((l) => l.title);

function pick(name: string) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, {target: {files: [new File(["x"], name, {type: "application/pdf"})]}});
}

beforeEach(() => {
  pending.length = 0;
  URL.createObjectURL = vi.fn(() => "blob:local");
});
afterEach(cleanup);

describe("a lecture upload that finishes later", () => {
  it("does not remove lectures added after the admin left and came back", async () => {
    render(<Harness />);
    fireEvent.click(await screen.findByText("Lectures"));
    pick("first.pdf");
    await waitFor(() => expect(lectureTitles()).toEqual(["first.pdf"]));

    fireEvent.click(screen.getByText("Practice"));
    fireEvent.click(screen.getByText("Lectures"));
    pick("second.pdf");
    await waitFor(() => expect(lectureTitles()).toEqual(["first.pdf", "second.pdf"]));
    pick("third.pdf");
    await waitFor(() => expect(lectureTitles()).toEqual(["first.pdf", "second.pdf", "third.pdf"]));

    await act(async () => pending[0].resolve("https://cdn/first.pdf"));

    expect(lectureTitles()).toEqual(["first.pdf", "second.pdf", "third.pdf"]);
    expect(latest[0].subTopics[0].modules[0].leaves[0].lessons?.[0].src).toBe("https://cdn/first.pdf");
    expect(latest[0].subTopics[0].modules[0].leaves[0].count).toBe(3);
  });
});
