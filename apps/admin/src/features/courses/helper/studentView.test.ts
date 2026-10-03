import {describe, expect, it} from "vitest";
import {
  formatLessonDuration,
  formatTotalDuration,
  studentLessonKind,
  studentOverview,
  toPracticeCardQuestions,
  toStudentModules,
} from "./studentView";
import {serializeModulesPayload} from "./course.mapper";
import type {CreatPracticeQuestionType, ModuleContent, Topic} from "../types/types";

const q = (id: string): CreatPracticeQuestionType => ({
  id,
  type: "single",
  question: `Q ${id}`,
  options: [
    {id: "a", text: "A", isCorrect: true},
    {id: "b", text: "B", isCorrect: false},
  ],
});

const lesson = (id: string, extra: Record<string, unknown> = {}): ModuleContent =>
  ({id, type: "lesson", title: `Lesson ${id}`, format: "MP4", size: "1mb", src: `https://x/${id}.mp4`, duration: 60, ...extra}) as ModuleContent;

const topics: Topic[] = [
  {
    id: "t1",
    label: "Topic 1",
    modules: [
      {
        id: "m1",
        label: "Module 1",
        content: [
          lesson("l1"),
          {id: "qz", type: "quiz", title: "Quiz", questions: [q("quiz1")], settings: {}},
          {id: "pr", type: "practice", name: "Practice", questions: [q("prac1"), q("prac2")]},
          {id: "ex", type: "exercise", name: "Exercise", questions: [q("ex1")]},
          lesson("l2", {format: "YOUTUBE", src: "https://youtu.be/abcdefghijk"}),
        ],
      },
    ],
  },
  {
    id: "t2",
    label: "Topic 2",
    modules: [
      {id: "m2", label: "", content: [lesson("l3", {content: "<h2>Hi</h2><p>x</p>", src: undefined})]},
      {id: "m3", label: "Empty", content: []},
    ],
  },
];

describe("toStudentModules", () => {
  const modules = toStudentModules(topics);

  it("flattens topics into one list of modules, in order", () => {
    expect(modules.map((m) => m.title)).toEqual(["Module 1", "Untitled Module", "Empty"]);
  });

  it("keeps lessons in order and classifies their kind", () => {
    expect(modules[0].lessons.map((l) => [l.id, l.kind])).toEqual([
      ["l1", "video"],
      ["l2", "youtube"],
    ]);
    expect(modules[1].lessons[0]).toMatchObject({kind: "html", url: null, html: "<h2>Hi</h2><p>x</p>"});
  });

  it("merges quiz then practice questions into one list, and drops exercises", () => {
    expect(modules[0].questions.map((x) => x.id)).toEqual(["quiz1", "prac1", "prac2"]);
    expect(modules[0].questions.map((x) => x.id)).not.toContain("ex1");
  });

  it("matches exactly what is saved: same module count, lectures and questions as serializeModulesPayload", () => {
    const saved = serializeModulesPayload(topics);
    expect(modules).toHaveLength(saved.length);
    modules.forEach((m, i) => {
      expect(m.lessons).toHaveLength(saved[i].lectures.length);
      expect(m.questions.map((x) => x.question)).toEqual(saved[i].quizzes.map((x) => x.question_text));
    });
  });

  it("handles no topics", () => {
    expect(toStudentModules([])).toEqual([]);
    expect(toStudentModules(undefined)).toEqual([]);
  });
});

describe("studentLessonKind", () => {
  it("html wins whenever there is lesson content", () => {
    expect(studentLessonKind({content: "<p>x</p>", format: "MP4", url: "https://x/a.mp4"})).toBe("html");
  });
  it("detects YouTube from the format or the link, PDF from the format, otherwise video", () => {
    expect(studentLessonKind({format: "YOUTUBE", url: null})).toBe("youtube");
    expect(studentLessonKind({format: "MP4", url: "https://www.youtube.com/watch?v=abcdefghijk"})).toBe("youtube");
    expect(studentLessonKind({format: "pdf", url: "https://x/a.pdf"})).toBe("pdf");
    expect(studentLessonKind({format: "MOV", url: "https://x/a.mov"})).toBe("video");
  });
});

describe("durations and overview", () => {
  it("formats totals like the learner app", () => {
    expect(formatTotalDuration(42 * 60)).toBe("42min");
    expect(formatTotalDuration(2 * 3600 + 5 * 60)).toBe("2hr 5min");
    expect(formatTotalDuration(0)).toBe("0min");
  });
  it("formats a single lesson as m:ss", () => {
    expect(formatLessonDuration(185)).toBe("3:05");
  });
  it("counts lessons and total length across modules", () => {
    const overview = studentOverview(toStudentModules(topics));
    expect(overview.lessonCount).toBe(3);
    expect(overview.totalDurationLabel).toBe("3min");
  });
});

describe("toPracticeCardQuestions", () => {
  it("gives single-choice questions one correct answer and multi-choice a list", () => {
    const multi: CreatPracticeQuestionType = {
      ...q("m"),
      type: "multiple",
      options: [
        {id: "a", text: "A", isCorrect: true},
        {id: "b", text: "B", isCorrect: true},
        {id: "c", text: "C", isCorrect: false},
      ],
    };
    const [single, many] = toPracticeCardQuestions([q("s"), multi]);
    expect(single).toMatchObject({correctAnswer: "A", multiSelect: false, answers: ["A", "B"]});
    expect(many).toMatchObject({correctAnswer: ["A", "B"], multiSelect: true});
  });
});
