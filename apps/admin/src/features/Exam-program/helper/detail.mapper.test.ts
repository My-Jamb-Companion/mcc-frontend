// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {deserializeExamTopics, toUiQuestion} from "./detail.mapper";
import type {ApiExamTopic} from "../services/exam.service";

const topic = (subExtra: Record<string, unknown> = {}, moduleExtra: Record<string, unknown> = {}): ApiExamTopic =>
  ({
    topic_id: "t",
    program_id: "p",
    title: "T",
    order_index: 0,
    created_at: "",
    sub_topics: [
      {
        sub_topic_id: "s",
        topic_id: "t",
        title: "S",
        description: null,
        order_index: 0,
        created_at: "",
        unit_exercises: [
          {question_id: "q", question_text: "Q", question_type: "single_choice", options: ["a", "b"], correct_answers: ["a"], explanation: "", description: null},
        ],
        modules: [
          {module_id: "m", sub_topic_id: "s", title: "M", order_index: 0, created_at: "", lectures: [], exercises: [], practices: [], ...moduleExtra},
        ],
        ...subExtra,
      },
    ],
  }) as unknown as ApiExamTopic;

describe("loading an exam program's timers and pass marks", () => {
  it("restores the unit Exercise's and the module Exercise's settings", () => {
    const [t] = deserializeExamTopics([
      topic(
        {test_timer_minutes: 45, test_passing_score: 75},
        {quiz_timer_minutes: 15, quiz_passing_score: 60},
      ),
    ]);
    expect(t.subTopics[0].testSettings).toEqual({timer: 45, passingScore: 75});
    expect(t.subTopics[0].modules[0].quizSettings).toEqual({timer: 15, passingScore: 60});
  });

  it("leaves them unset when the API has none", () => {
    const [t] = deserializeExamTopics([
      topic({test_timer_minutes: null, test_passing_score: null}, {quiz_timer_minutes: null, quiz_passing_score: null}),
    ]);
    expect(t.subTopics[0].testSettings).toBeUndefined();
    expect(t.subTopics[0].modules[0].quizSettings).toBeUndefined();
  });

  it("keeps a pass mark of 0 and a timer with no pass mark", () => {
    const [t] = deserializeExamTopics([topic({test_timer_minutes: null, test_passing_score: 0}, {quiz_timer_minutes: 10})]);
    expect(t.subTopics[0].testSettings).toEqual({timer: undefined, passingScore: 0});
    expect(t.subTopics[0].modules[0].quizSettings).toEqual({timer: 10, passingScore: undefined});
  });
});

describe("loading practice option responses", () => {
  it("puts each saved response back on its option", () => {
    const t = topic(
      {},
      {
        practices: [
          {question_id: "p", question_text: "Q", question_type: "single_choice", options: ["a", "b"], correct_answers: ["a"], explanation: "", description: null, option_feedback: ["Right", null]},
        ],
      },
    );
    const [loaded] = deserializeExamTopics([t]);
    const practice = loaded.subTopics[0].modules[0].leaves.find((l) => l.type === "practice");
    const options = practice && "questions" in practice ? practice.questions?.[0].options : [];
    expect(options?.map((o) => o.response)).toEqual(["Right", undefined]);
  });
});


describe("loading lecture files", () => {
  const withLectures = (lectures: Record<string, unknown>[]) =>
    deserializeExamTopics([topic({}, {lectures})])[0].subTopics[0].modules[0].leaves[0].lessons ?? [];

  it("recognises an uploaded PDF so it shows as a PDF, not a video", () => {
    const [pdf, video] = withLectures([
      {lecture_id: "a", title: "Notes", video_url: "https://cdn/x/abc-Notes.pdf", content: null, file_size_bytes: 4096},
      {lecture_id: "b", title: "Clip", video_url: "https://cdn/x/abc-clip.mp4", content: null},
    ]);
    expect(pdf.format).toBe("PDF");
    expect(pdf.fileSizeBytes).toBe(4096);
    expect(video.format).toBe("MP4");
  });
});

describe("loading a module's Exercise", () => {
  const q = {question_id: "q", question_text: "Q", question_type: "single_choice", options: ["a", "b"], correct_answers: ["a"], explanation: "", description: null};

  it("gives every module an Exercise to author, empty or not", () => {
    const [t] = deserializeExamTopics([topic()]);
    const leaves = t.subTopics[0].modules[0].leaves;
    expect(leaves.map((l) => l.type)).toEqual(["lectures", "practice", "exercise"]);
    expect(leaves[2]).toMatchObject({label: "Exercise", count: 0});
  });

  it("reads the module and unit Exercise from an older server's quizzes and test_exercises", () => {
    const old = topic({unit_exercises: undefined, test_exercises: [q]}, {exercises: undefined, quizzes: [q, q]});
    const [t] = deserializeExamTopics([old]);
    expect(t.subTopics[0].modules[0].leaves[2].questions).toHaveLength(2);
    expect(t.subTopics[0].hasQuiz).toBe(true);
    expect(t.subTopics[0].quizQuestions).toHaveLength(1);
  });
});

describe("ids when loading", () => {
  it("keeps the ids the server gave, so a save sends them back", () => {
    const [t] = deserializeExamTopics([topic()]);
    expect(t.id).toBe("t");
    expect(t.subTopics[0].id).toBe("s");
    expect(t.subTopics[0].modules[0].id).toBe("m");
    expect(t.subTopics[0].quizQuestions?.[0].id).toBe("q");
  });
});


describe("loading practice sets", () => {
  const apiQuestion = (text: string, set_name: string | null) => ({
    question_id: text, question_text: text, description: null, question_type: "single_choice", options: ["A", "B"], correct_answers: ["A"],
    explanation: "", option_feedback: null, set_name, order_index: 0, parent_id: "m", parent_type: "module", usage_type: "practice", created_at: "",
  });
  const load = (practices: unknown[]) => {
    const topics = [{
      topic_id: "t", program_id: "p", title: "T", order_index: 0, created_at: "",
      sub_topics: [{sub_topic_id: "s", topic_id: "t", title: "S", description: null, order_index: 0, created_at: "", unit_exercises: [], modules: [
        {module_id: "m", sub_topic_id: "s", title: "M", order_index: 0, created_at: "", lectures: [], exercises: [], practices},
      ]}],
    }] as unknown as ApiExamTopic[];
    const leaf = deserializeExamTopics(topics)[0].subTopics[0].modules[0].leaves.find((l) => l.type === "practice");
    return leaf!;
  };

  it("groups the practice questions into their sets, in the order they first appear", () => {
    const leaf = load([apiQuestion("D1", null), apiQuestion("P1", "Passages"), apiQuestion("D2", null), apiQuestion("V1", "Vocab"), apiQuestion("P2", "Passages")]);
    expect(leaf.sets?.map((s) => [s.name, s.questions.map((x) => x.question)])).toEqual([
      ["", ["D1", "D2"]], ["Passages", ["P1", "P2"]], ["Vocab", ["V1"]],
    ]);
  });

  it("still holds every question and the count, for the places that read them flat", () => {
    const leaf = load([apiQuestion("D1", null), apiQuestion("P1", "Passages")]);
    expect(leaf.count).toBe(2);
    expect(leaf.questions?.map((x) => x.question)).toEqual(["D1", "P1"]);
  });

  it("a module with no practice has no sets", () => {
    expect(load([]).sets).toEqual([]);
  });
});

describe("a mock exam question's topic", () => {
  const api = {question_id: "q", question_text: "Q", description: null, question_type: "single_choice", options: ["a", "b"], correct_answers: ["a"], explanation: null};
  it("comes back from the server when it has one", () => {
    expect(toUiQuestion({...api, topic: "Comprehension"} as never).topic).toBe("Comprehension");
    expect(toUiQuestion({...api, topic: null} as never).topic).toBeUndefined();
  });
});
