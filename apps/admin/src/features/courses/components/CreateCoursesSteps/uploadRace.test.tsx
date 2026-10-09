// @vitest-environment jsdom
/**
 * Lessons were lost when a video upload finished after the admin had moved away
 * from that module's Lessons view: the finished upload wrote back the module as it
 * looked when they left, wiping everything added since. An upload finishing must
 * only fill in its own lesson's file address.
 */
import {act, cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {FormProvider, useForm} from "@mcc/features";
import ContentStep from "./Step2";
import type {ContentFormValues, LessonModuleContent, Topic} from "@/src/features/courses/types/types";

vi.mock("@/src/components/LessonHtmlEditor", () => ({default: () => null}));

const pending: {resolve: (url: string) => void}[] = [];
vi.mock("@/src/features/courses/services/media.service", () => ({
  uploadMedia: vi.fn(
    () => new Promise<string>((resolve) => pending.push({resolve})),
  ),
}));

const topics: Topic[] = [
  {
    id: "t1",
    label: "Topic",
    modules: [{id: "m2", label: "Module 2", content: []}],
  },
];

let latest: Topic[] = [];
function Harness() {
  const methods = useForm<ContentFormValues>({defaultValues: {content: {topics}}});
  latest = methods.watch("content.topics");
  return (
    <FormProvider {...methods}>
      <ContentStep courseName="Course" />
    </FormProvider>
  );
}

const lessons = () =>
  latest.flatMap((t) => t.modules).flatMap((m) => m.content).filter((c): c is LessonModuleContent => c.type === "lesson");
const lessonTitles = () => lessons().map((c) => c.title);

function pick(name: string) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(["x"], name, {type: "application/pdf"});
  fireEvent.change(input, {target: {files: [file]}});
}

beforeEach(() => {
  pending.length = 0;
  URL.createObjectURL = vi.fn(() => "blob:local");
});
afterEach(cleanup);

describe("a lesson upload that finishes later", () => {
  it("does not remove lessons added after the admin left and came back", async () => {
    render(<Harness />);
    fireEvent.click(await screen.findByText("Lessons"));

    pick("first.pdf");
    await waitFor(() => expect(lessonTitles()).toEqual(["first.pdf"]));

    // Leave the Lessons view for Practice, then come back to Lessons and add two more.
    fireEvent.click(screen.getByText("Practice"));
    fireEvent.click(screen.getByText("Lessons"));
    pick("second.pdf");
    await waitFor(() => expect(lessonTitles()).toEqual(["first.pdf", "second.pdf"]));
    pick("third.pdf");
    await waitFor(() => expect(lessonTitles()).toEqual(["first.pdf", "second.pdf", "third.pdf"]));

    // The first upload only now completes.
    await act(async () => pending[0].resolve("https://cdn/first.pdf"));

    expect(lessonTitles()).toEqual(["first.pdf", "second.pdf", "third.pdf"]);
    expect(lessons().find((c) => c.title === "first.pdf")?.src).toBe("https://cdn/first.pdf");
  });

  it("does not remove lessons added in another module", async () => {
    render(<Harness />);
    fireEvent.click(await screen.findByText("Lessons"));
    pick("first.pdf");
    await waitFor(() => expect(lessonTitles()).toEqual(["first.pdf"]));
    fireEvent.click(screen.getByText("Practice"));

    await act(async () => pending[0].resolve("https://cdn/first.pdf"));
    expect(lessonTitles()).toEqual(["first.pdf"]);
  });
});
