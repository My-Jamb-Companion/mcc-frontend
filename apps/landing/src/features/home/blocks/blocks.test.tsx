import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { BLOCK_BY_TYPE } from "@mcc/landing-content";
import { Audience } from "./Audience";
import { Brainy } from "./Brainy";
import { Exams } from "./Exams";
import { Hero } from "./Hero";
import { Practice } from "./Practice";
import { Progress } from "./Progress";
import { Steps } from "./Steps";

afterEach(cleanup);

const defaults = (type: string) => BLOCK_BY_TYPE[type].defaults;

describe("hero", () => {
  it("shows the photo from the content, the built-in one for old content, and none when cleared", () => {
    const { container, rerender } = render(<Hero blockId="h" data={{ ...defaults("hero"), photo_url: "/mine.webp" }} />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/mine.webp");
    const { photo_url: _removed, ...old } = defaults("hero") as Record<string, unknown>;
    void _removed;
    rerender(<Hero blockId="h" data={old} />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/landing/hero-photo.webp");
    rerender(<Hero blockId="h" data={{ ...defaults("hero"), photo_url: "" }} />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("lets a visitor pick which screen the phone shows", () => {
    render(<Hero blockId="h" data={defaults("hero")} />);
    const dots = screen.getAllByRole("button", { name: /Show/ });
    expect(dots).toHaveLength(3);
    expect(dots[0].getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Show quiz" }));
    expect(screen.getByRole("button", { name: "Show quiz" }).getAttribute("aria-pressed")).toBe("true");
  });
});

describe("audience", () => {
  it("draws a card per entry, each linking where the content says", () => {
    const { container } = render(<Audience blockId="a" data={defaults("audience")} />);
    const links = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(links).toEqual(["#exams", "#parents", "#courses"]);
    expect(screen.getByText("Preparing for a big exam")).toBeTruthy();
  });
});

describe("exams", () => {
  it("makes the first cards large and finds exams by their subjects", () => {
    const { container } = render(<Exams blockId="e" data={defaults("exams")} />);
    expect(container.querySelectorAll(".mcc-exam-big")).toHaveLength(2);
    fireEvent.change(screen.getByLabelText("Search exams and subjects"), { target: { value: "reading" } });
    const cards = container.querySelectorAll(".mcc-exam-card");
    expect(cards).toHaveLength(1);
    expect(within(cards[0] as HTMLElement).getAllByText("SAT").length).toBeGreaterThan(0);
  });

  it("copes with exams saved before cards had colours, sizes or subjects", () => {
    const data = { headline: "Pick", exams: [{ code: "JAMB", name: "UTME", note: "n", tags: "english", href: "/signup" }, { code: "WAEC", name: "W", note: "n", tags: "", href: "/signup" }, { code: "NECO", name: "N", note: "n", tags: "", href: "/signup" }] };
    const { container } = render(<Exams blockId="e" data={data} />);
    expect(container.querySelectorAll(".mcc-exam-card")).toHaveLength(3);
    expect(container.querySelectorAll(".mcc-exam-big")).toHaveLength(2);
  });

  it("shows the sticker only when there is one", () => {
    const { rerender } = render(<Exams blockId="e" data={{ ...defaults("exams"), sticker: "or three!" }} />);
    expect(screen.getByText("or three!")).toBeTruthy();
    rerender(<Exams blockId="e" data={{ ...defaults("exams"), sticker: "" }} />);
    expect(screen.queryByText("or three!")).toBeNull();
  });
});

describe("steps", () => {
  it("lights the step a visitor picks and fills the bar up to it", () => {
    render(<Steps blockId="s" data={defaults("steps")} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4);
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    fireEvent.click(tabs[2]);
    expect(screen.getAllByRole("tab")[2].getAttribute("aria-selected")).toBe("true");
    expect(screen.getAllByRole("tab")[0].getAttribute("aria-selected")).toBe("false");
  });

  it("names steps that have no short name", () => {
    const data = { ...defaults("steps"), steps: [{ title: "A", body: "a" }, { title: "B", body: "b" }] };
    render(<Steps blockId="s" data={data} />);
    expect(screen.getByRole("tab", { name: /01 Sign up/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /02 Free call/ })).toBeTruthy();
  });
});

describe("brainy and progress", () => {
  it("draw their panels and let a click pick one", () => {
    render(<Brainy blockId="b" data={defaults("brainy")} />);
    expect(screen.getByText("Snap or upload your notes")).toBeTruthy();
    fireEvent.click(screen.getByText("Get flashcards and quizzes"));
    cleanup();
    render(<Progress blockId="p" data={defaults("progress")} />);
    expect(screen.getByText("Climb the weekly leaderboard")).toBeTruthy();
  });

  it("only offers a demo video when the content has one", () => {
    const { container, rerender } = render(<Brainy blockId="b" data={defaults("brainy")} />);
    expect(screen.queryByText("Watch Brainy in action")).toBeNull();
    rerender(<Brainy blockId="b" data={{ ...defaults("brainy"), demo_video_url: "https://cdn/x/demo.mp4" }} />);
    expect(screen.getByText("Watch Brainy in action")).toBeTruthy();
    expect(container.querySelector("video")).toBeNull(); // nothing downloads until it is tapped
    fireEvent.click(screen.getByRole("button", { name: "Watch Brainy in action" }));
    expect(container.querySelector("video")?.getAttribute("src")).toBe("https://cdn/x/demo.mp4");
  });
});

describe("practice", () => {
  it("plays the sample test: answer, explanation, submit, score", () => {
    render(<Practice blockId="p" data={defaults("practice")} />);
    fireEvent.click(screen.getByRole("button", { name: /^B\s*4/ }));
    expect(screen.getByText("Nice one!")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next question" }));
    expect(screen.getByText("Question 2 of 3")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /^B\s*2/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next question" }));
    fireEvent.click(screen.getByRole("button", { name: /^A\s*Frank/ }));
    fireEvent.click(screen.getByRole("button", { name: "Submit test" }));
    expect(screen.getByText("Marking your test…")).toBeTruthy();
  });
});
