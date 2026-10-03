import {describe, expect, it} from "vitest";
import {
  appendQuestions,
  ApiBankQuestion,
  bankQuestionKey,
  countWithResponses,
  editorQuestionKey,
  fromBankQuestion,
  ParsedQuestion,
  parsedToBankPayload,
  questionProblem,
  splitForBank,
  toBankQuestion,
} from "./bank";
import type {CreatPracticeQuestionType} from "./types";

const q = (over: Partial<CreatPracticeQuestionType> = {}): CreatPracticeQuestionType => ({
  id: "q",
  type: "single",
  question: "What is 2+2?",
  options: [
    {id: "a", text: "3", isCorrect: false},
    {id: "b", text: "4", isCorrect: true},
  ],
  ...over,
});

const bank = (over: Partial<ApiBankQuestion> = {}): ApiBankQuestion => ({
  bank_id: "qb_1",
  question_text: "What is 2+2?",
  question_type: "single_choice",
  options: ["3", "4"],
  correct_answers: ["4"],
  option_feedback: ["No", "Yes"],
  subject_id: null,
  subject_name: null,
  topic: null,
  difficulty: null,
  tags: [],
  source: "manual",
  created_at: null,
  updated_at: null,
  ...over,
});

describe("questionProblem", () => {
  it("accepts a complete question", () => expect(questionProblem(q())).toBeNull());

  it.each([
    [q({question: "  "}), "no question text"],
    [q({options: [{id: "a", text: "x", isCorrect: true}]}), "two options"],
    [q({options: [{id: "a", text: "x", isCorrect: true}, {id: "b", text: " ", isCorrect: false}]}), "empty option"],
    [q({options: [{id: "a", text: "x", isCorrect: true}, {id: "b", text: "X ", isCorrect: false}]}), "identical"],
    [q({options: [{id: "a", text: "x", isCorrect: false}, {id: "b", text: "y", isCorrect: false}]}), "no correct"],
    [q({options: [{id: "a", text: "x", isCorrect: true}, {id: "b", text: "y", isCorrect: true}]}), "exactly one"],
  ])("explains what is missing (%#)", (question, text) => {
    expect(questionProblem(question)).toContain(text);
  });

  it("lets a multiple-choice question have several correct answers", () => {
    const multi = q({type: "multiple", options: [{id: "a", text: "x", isCorrect: true}, {id: "b", text: "y", isCorrect: true}]});
    expect(questionProblem(multi)).toBeNull();
  });
});

describe("toBankQuestion", () => {
  it("trims, maps the type and leaves out empty extras", () => {
    expect(toBankQuestion(q({question: " Hi ", explanation: " "}))).toEqual({
      question_text: "Hi",
      question_type: "single_choice",
      options: ["3", "4"],
      correct_answers: ["4"],
    });
  });

  it("sends Practice responses aligned to the options", () => {
    const withResponses = q({
      options: [
        {id: "a", text: "3", isCorrect: false, response: " No "},
        {id: "b", text: "4", isCorrect: true},
      ],
    });
    expect(toBankQuestion(withResponses).option_feedback).toEqual(["No", null]);
  });
});

describe("fromBankQuestion", () => {
  it("makes an independent copy with fresh ids and the right answers marked", () => {
    const copy = fromBankQuestion(bank(), false);
    expect(copy.type).toBe("single");
    expect(copy.options.map((o) => [o.text, o.isCorrect])).toEqual([["3", false], ["4", true]]);
    expect(new Set(copy.options.map((o) => o.id)).size).toBe(2);
    expect(copy.id).not.toBe("qb_1");
  });

  it("brings responses across only into a Practice set", () => {
    expect(fromBankQuestion(bank(), true).options.map((o) => o.response)).toEqual(["No", "Yes"]);
    expect(fromBankQuestion(bank(), false).options.every((o) => !("response" in o))).toBe(true);
  });

  it("keeps multiple choice and a null-feedback question", () => {
    const copy = fromBankQuestion(
      bank({question_type: "multi_choice", options: ["a", "b", "c"], correct_answers: ["A", "c"], option_feedback: null}),
      true,
    );
    expect(copy.type).toBe("multiple");
    expect(copy.options.filter((o) => o.isCorrect).map((o) => o.text)).toEqual(["a", "c"]);
  });

  it("round-trips through the bank payload", () => {
    const original = q();
    const copy = fromBankQuestion({...bank(), ...toBankQuestion(original), option_feedback: null}, true);
    expect(editorQuestionKey(copy)).toBe(editorQuestionKey(original));
  });
});

describe("identity", () => {
  it("matches the same question however it is spelled or ordered", () => {
    const reordered = q({question: "what is  2+2?", options: [{id: "b", text: "4", isCorrect: true}, {id: "a", text: "3", isCorrect: false}]});
    expect(editorQuestionKey(reordered)).toBe(bankQuestionKey(bank()));
  });

  it("treats a different correct answer as a different question", () => {
    const other = q({options: [{id: "a", text: "3", isCorrect: true}, {id: "b", text: "4", isCorrect: false}]});
    expect(editorQuestionKey(other)).not.toBe(bankQuestionKey(bank()));
  });
});

describe("appendQuestions", () => {
  const blank = q({id: "blank", question: "", options: [{id: "a", text: "", isCorrect: false}, {id: "b", text: "", isCorrect: false}]});

  it("drops the untouched blank question a new set starts with", () => {
    expect(appendQuestions([blank], [q({id: "n"})]).map((x) => x.id)).toEqual(["n"]);
  });

  it("keeps real questions and appends in order", () => {
    expect(appendQuestions([q({id: "a"}), blank], [q({id: "n"})]).map((x) => x.id)).toEqual(["a", "n"]);
  });
});

describe("splitForBank", () => {
  it("separates ready questions from incomplete ones and ignores blanks", () => {
    const blank = q({question: "", options: [{id: "a", text: "", isCorrect: false}, {id: "b", text: "", isCorrect: false}]});
    const bad = q({question: "Half done", options: [{id: "a", text: "x", isCorrect: false}, {id: "b", text: "y", isCorrect: false}]});
    const {ready, problems} = splitForBank([q(), blank, bad]);
    expect(ready).toHaveLength(1);
    expect(problems).toEqual([{index: 2, problem: "has no correct answer marked"}]);
  });
});

describe("uploaded questions", () => {
  const parsed = (over: Partial<ParsedQuestion> = {}): ParsedQuestion => ({
    row: 2,
    question_text: "What is 2+2?",
    question_type: "single_choice",
    options: ["3", "4"],
    correct_answers: ["4"],
    explanation: null,
    option_feedback: null,
    subject_id: null,
    subject_name: null,
    topic: null,
    difficulty: null,
    ...over,
  });

  it("copies into a set like a bank question, responses only for Practice", () => {
    const withFeedback = parsed({option_feedback: ["No", "Yes"]});
    expect(fromBankQuestion(withFeedback, true).options.map((o) => o.response)).toEqual(["No", "Yes"]);
    expect(fromBankQuestion(withFeedback, false).options.every((o) => !("response" in o))).toBe(true);
    expect(fromBankQuestion(parsed(), false).options.filter((o) => o.isCorrect).map((o) => o.text)).toEqual(["4"]);
  });

  it("keeps its own filing and its responses when saved to the bank", () => {
    expect(
      parsedToBankPayload(parsed({subject_id: "s1", topic: "Algebra", difficulty: "hard", option_feedback: ["a", null], explanation: "Why"})),
    ).toEqual({
      question_text: "What is 2+2?",
      question_type: "single_choice",
      options: ["3", "4"],
      correct_answers: ["4"],
      explanation: "Why",
      option_feedback: ["a", null],
      subject_id: "s1",
      topic: "Algebra",
      difficulty: "hard",
    });
  });

  it("leaves out what the file did not give", () => {
    expect(Object.keys(parsedToBankPayload(parsed())).sort()).toEqual(["correct_answers", "options", "question_text", "question_type"]);
  });

  it("counts the questions that carry responses", () => {
    expect(countWithResponses([parsed(), parsed({option_feedback: [null, "x"]}), parsed({option_feedback: [null, null]})])).toBe(1);
  });
});
