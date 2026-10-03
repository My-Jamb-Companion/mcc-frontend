import {describe, expect, it} from "vitest";
import {allExamLectures, examProgramTitle, hasPreviewableExamContent, toStudentExamTree} from "./studentView";
import {serializeTopicsPayload} from "./content.mapper";
import type {Topic} from "../components/CreateProgramSteps/Step2";
import type {CreatPracticeQuestionType} from "../components/CreateProgramSteps/PracticeQuestions";

const q = (id: string): CreatPracticeQuestionType => ({
  id,
  type: "single",
  question: `Q ${id}`,
  explanation: id === "p1" ? "Because" : undefined,
  options: [
    {id: "a", text: "A", isCorrect: true},
    {id: "b", text: "B", isCorrect: false},
  ],
});

const topics: Topic[] = [
  {
    id: "t1",
    label: "Comprehension",
    subTopics: [
      {
        id: "s1",
        label: "Summary",
        hasQuiz: true,
        quizQuestions: [q("t1"), q("t2")],
        testSettings: {timer: 30, passingScore: 65},
        modules: [
          {
            id: "m1",
            label: "Modules",
            leaves: [
              {
                id: "l",
                label: "Lectures",
                type: "lectures",
                lessons: [
                  {id: "a", title: "Intro", format: "MP4", size: "1mb", src: "https://x/a.mp4"},
                  {id: "b", title: "Yt", format: "MP4", size: "1mb", src: "https://youtu.be/abcdefghijk"},
                  {id: "c", title: "Text", format: "HTML", size: "1kb", content: "<h2>Hi</h2>"},
                ],
              },
              {id: "p", label: "Practice", type: "practice", questions: [q("p1")]},
              {id: "z", label: "Quiz", type: "quiz", questions: [q("z1")]},
            ],
          },
          {id: "m2", label: "", leaves: []},
        ],
      },
      {id: "s2", label: "No test", hasQuiz: false, quizQuestions: [q("hidden")], modules: []},
    ],
  },
];

describe("toStudentExamTree", () => {
  const tree = toStudentExamTree(topics);

  it("keeps the topic > sub-topic > module hierarchy students see", () => {
    expect(tree[0].subTopics.map((s) => s.title)).toEqual(["Summary", "No test"]);
    expect(tree[0].subTopics[0].modules.map((m) => m.title)).toEqual(["Modules", "Untitled Module"]);
  });

  it("classifies lectures as html, youtube or video", () => {
    const lectures = tree[0].subTopics[0].modules[0].lectures;
    expect(lectures.map((l) => [l.title, l.kind])).toEqual([
      ["Intro", "video"],
      ["Yt", "youtube"],
      ["Text", "html"],
    ]);
    expect(lectures[2].url).toBeNull();
  });

  it("separates quiz, practice and the sub-topic test", () => {
    const m = tree[0].subTopics[0].modules[0];
    expect(m.quiz.map((x) => x.id)).toEqual(["z1"]);
    expect(m.practice.map((x) => x.id)).toEqual(["p1"]);
    expect(tree[0].subTopics[0].test.map((x) => x.id)).toEqual(["t1", "t2"]);
  });

  it("only offers a test when the sub-topic's test is switched on", () => {
    expect(tree[0].subTopics[1].test).toEqual([]);
  });

  it("gives the Test its timer and passing score, and none without a Test", () => {
    expect(tree[0].subTopics[0]).toMatchObject({testTimerMinutes: 30, testPassingScore: 65});
    expect(tree[0].subTopics[1]).toMatchObject({testTimerMinutes: null, testPassingScore: null});
  });

  it("carries options, correct answers and explanations", () => {
    expect(tree[0].subTopics[0].modules[0].practice[0]).toEqual({
      id: "p1",
      text: "Q p1",
      options: ["A", "B"],
      correctAnswers: ["A"],
      explanation: "Because",
    });
  });

  it("matches what is saved: same counts as serializeTopicsPayload", () => {
    const saved = serializeTopicsPayload(topics);
    saved.forEach((t, ti) =>
      t.sub_topics.forEach((s, si) => {
        expect(tree[ti].subTopics[si].test).toHaveLength(s.test_exercises.length);
        s.modules.forEach((m, mi) => {
          const mod = tree[ti].subTopics[si].modules[mi];
          expect(mod.lectures).toHaveLength(m.lectures.length);
          expect(mod.quiz).toHaveLength(m.quizzes.length);
          expect(mod.practice).toHaveLength(m.practices.length);
        });
      }),
    );
  });
});

describe("helpers", () => {
  it("lists every lecture in tree order", () => {
    expect(allExamLectures(toStudentExamTree(topics)).map((l) => l.id)).toEqual(["a", "b", "c"]);
  });
  it("is previewable only with a lecture or a question", () => {
    expect(hasPreviewableExamContent([])).toBe(false);
    expect(hasPreviewableExamContent([{id: "t", label: "T", subTopics: [{id: "s", label: "S", modules: [{id: "m", label: "M", leaves: []}]}]}])).toBe(false);
    expect(hasPreviewableExamContent(topics)).toBe(true);
  });
  it("titles a program like the learner app", () => {
    expect(examProgramTitle("JAMB", "English")).toBe("JAMB — English");
    expect(examProgramTitle("", "")).toBe("Exam prep program");
  });
});
