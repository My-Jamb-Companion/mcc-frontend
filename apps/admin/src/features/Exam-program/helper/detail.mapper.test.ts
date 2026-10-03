// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {deserializeExamTopics} from "./detail.mapper";
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
        test_exercises: [
          {question_id: "q", question_text: "Q", question_type: "single_choice", options: ["a", "b"], correct_answers: ["a"], explanation: "", description: null},
        ],
        modules: [
          {module_id: "m", sub_topic_id: "s", title: "M", order_index: 0, created_at: "", lectures: [], quizzes: [], practices: [], ...moduleExtra},
        ],
        ...subExtra,
      },
    ],
  }) as unknown as ApiExamTopic;

describe("loading an exam program's timers and pass marks", () => {
  it("restores the Test's and the module Quiz's settings", () => {
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
