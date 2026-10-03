import {describe, expect, it} from "vitest";
import {deserializeModulesPayload, fromApiCourseDetail, serializeModulesPayload} from "./course.mapper";
import type {CreatPracticeQuestionType, Topic} from "../types/types";

const api = (over: Record<string, unknown>) =>
  ({
    course_id: "c1",
    title: "T",
    description: "D",
    price: "0",
    level: "all_levels",
    tags: [],
    learning_outcomes: [],
    modules: [],
    teacher: null,
    ...over,
  }) as never;

describe("fromApiCourseDetail uploads", () => {
  it("treats a saved cover image and promo video as present, so Publish and preview unlock", () => {
    const {upload} = fromApiCourseDetail(api({cover_image_url: "https://x/c.jpg", promo_video_url: "https://x/p.mp4"}));
    expect(upload.coverImage).toEqual({previewUrl: "https://x/c.jpg", remoteUrl: "https://x/c.jpg"});
    expect(upload.promoVideo).toEqual({previewUrl: "https://x/p.mp4", remoteUrl: "https://x/p.mp4"});
    expect(upload.coverImageUrl).toBe("https://x/c.jpg");
  });

  it("leaves them empty when nothing was uploaded", () => {
    const {upload} = fromApiCourseDetail(api({cover_image_url: null, promo_video_url: null}));
    expect(upload.coverImage).toBeNull();
    expect(upload.promoVideo).toBeNull();
  });
});

const question = (id: string, correct = "A"): CreatPracticeQuestionType => ({
  id,
  type: "single",
  question: `Q ${id}`,
  options: [
    {id: "a", text: "A", isCorrect: correct === "A"},
    {id: "b", text: "B", isCorrect: correct === "B"},
  ],
});

const authored: Topic[] = [
  {
    id: "t",
    label: "T",
    modules: [
      {
        id: "m",
        label: "Module",
        content: [
          {id: "l", type: "lesson", title: "Lesson", format: "MP4", size: "1mb", src: "https://x/a.mp4"},
          {id: "p", type: "practice", name: "Warm-up", questions: [question("p1")]},
          {id: "q", type: "quiz", title: "Check", questions: [question("q1")], settings: {}},
          {id: "e1", type: "exercise", name: "Algebra drill", questions: [question("e1a"), question("e1b", "B")]},
          {id: "e2", type: "exercise", name: "Geometry drill", questions: [question("e2a")]},
        ],
      },
    ],
  },
];

describe("saving exercises", () => {
  it("sends every set's questions tagged with its kind and name, exercises included", () => {
    const [module] = serializeModulesPayload(authored);
    expect(module.quizzes.map((x) => [x.question_text, x.usage_type, x.set_name])).toEqual([
      ["Q p1", "practice", "Warm-up"],
      ["Q q1", "quiz", "Check"],
      ["Q e1a", "exercise", "Algebra drill"],
      ["Q e1b", "exercise", "Algebra drill"],
      ["Q e2a", "exercise", "Geometry drill"],
    ]);
  });

  it("rebuilds the same sets, with their kinds and names, when the course is loaded again", () => {
    const [topic] = deserializeModulesPayload(serializeModulesPayload(authored));
    const sets = topic.modules[0].content.flatMap((c) =>
      c.type === "lesson"
        ? []
        : [[c.type, c.type === "quiz" ? c.title : c.name, c.questions.map((x) => x.question)] as const],
    );
    expect(sets).toEqual([
      ["practice", "Warm-up", ["Q p1"]],
      ["quiz", "Check", ["Q q1"]],
      ["exercise", "Algebra drill", ["Q e1a", "Q e1b"]],
      ["exercise", "Geometry drill", ["Q e2a"]],
    ]);
  });

  it("keeps which answer is correct through a save and reload", () => {
    const [topic] = deserializeModulesPayload(serializeModulesPayload(authored));
    const drill = topic.modules[0].content.find((c) => c.type === "exercise");
    const second = drill && "questions" in drill ? drill.questions[1] : null;
    expect(second?.options.filter((o) => o.isCorrect).map((o) => o.text)).toEqual(["B"]);
  });

  it("treats questions saved before sets were recorded as one practice set", () => {
    const [topic] = deserializeModulesPayload([
      {
        title: "Old",
        lectures: [],
        quizzes: [
          {question_text: "A?", question_type: "single_choice", options: ["x", "y"], correct_answers: ["x"]},
          {question_text: "B?", question_type: "single_choice", options: ["x", "y"], correct_answers: ["y"]},
        ],
      },
    ]);
    const content = topic.modules[0].content;
    expect(content).toHaveLength(1);
    expect(content[0]).toMatchObject({type: "practice", name: "Practice"});
  });
});

describe("quiz timer and passing score", () => {
  const withQuiz = (settings: {timer?: number; passingScore?: number}, title = "Final"): Topic[] => [
    {
      id: "t",
      label: "T",
      modules: [
        {
          id: "m",
          label: "Module",
          content: [{id: "q", type: "quiz", title, questions: [question("q1")], settings}],
        },
      ],
    },
  ];

  it("sends them with the quiz, keyed by its name", () => {
    const [module] = serializeModulesPayload(withQuiz({timer: 20, passingScore: 70}));
    expect(module.quiz_settings).toEqual([{set_name: "Final", timer_minutes: 20, passing_score: 70}]);
  });

  it("sends a pass mark of 0 and omits an unset timer", () => {
    const [module] = serializeModulesPayload(withQuiz({passingScore: 0}));
    expect(module.quiz_settings).toEqual([{set_name: "Final", timer_minutes: undefined, passing_score: 0}]);
  });

  it("sends nothing for a quiz with neither", () => {
    expect(serializeModulesPayload(withQuiz({}))[0].quiz_settings).toBeUndefined();
  });

  it("keys an unnamed quiz as 'Quiz', matching what the API calls it", () => {
    const [module] = serializeModulesPayload(withQuiz({timer: 5}, "  "));
    expect(module.quiz_settings?.[0].set_name).toBe("Quiz");
  });

  it("restores them on the quiz when the course is loaded again", () => {
    const loaded = deserializeModulesPayload([
      {
        title: "Module",
        lectures: [],
        quizzes: [
          {question_text: "Q", question_type: "single_choice", options: ["a", "b"], correct_answers: ["a"], usage_type: "quiz", set_name: "Final"},
        ],
        quiz_settings: [{set_name: "Final", timer_minutes: 20, passing_score: 70}],
      },
    ]);
    const quiz = loaded[0].modules[0].content[0];
    expect(quiz).toMatchObject({type: "quiz", title: "Final", settings: {timer: 20, passingScore: 70}});
  });

  it("survives a save and reload", () => {
    const [topic] = deserializeModulesPayload(serializeModulesPayload(withQuiz({timer: 15, passingScore: 60})));
    expect(topic.modules[0].content[0]).toMatchObject({type: "quiz", title: "Final", settings: {timer: 15, passingScore: 60}});
  });
});
