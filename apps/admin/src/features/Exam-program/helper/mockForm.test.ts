// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import type {CreatPracticeQuestionType} from "@/src/features/question-editor/types";
import type {ApiMockPaperDetail, ApiMockPool} from "../services/mocks.service";
import {
  blueprintItems,
  blueprintTotal,
  emptyMockForm,
  formFromDetail,
  mockPayload,
  plannedQuestionCount,
  validateMockForm,
} from "./mockForm";

const pool: ApiMockPool = {
  total: 30,
  modules: [
    {module_id: "m1", title: "Algebra", sub_topic_title: "S", topic_title: "T", questions: 20},
    {module_id: "m2", title: "Geometry", sub_topic_title: "S", topic_title: "T", questions: 10},
  ],
};

const question = (over: Partial<CreatPracticeQuestionType> = {}): CreatPracticeQuestionType => ({
  id: "q1", type: "single", question: "2 + 2?",
  options: [{id: "a", text: "3", isCorrect: false}, {id: "b", text: "4", isCorrect: true, response: "Yes."}],
  ...over,
});

const form = (over = {}) => ({...emptyMockForm(), title: "Mock 1", ...over});

describe("validateMockForm", () => {
  it("accepts a sensible auto paper", () => {
    expect(validateMockForm(form({published: true, questionCount: "20"}), pool)).toEqual([]);
  });

  it("needs a title and a sensible duration", () => {
    expect(validateMockForm(form({title: " "}), pool)).toContain("Give the mock exam a title.");
    expect(validateMockForm(form({duration: "0"}), pool)[0]).toMatch(/between 1 and 360/);
    expect(validateMockForm(form({duration: "400"}), pool)[0]).toMatch(/between 1 and 360/);
    expect(validateMockForm(form({duration: "abc"}), pool)[0]).toMatch(/between 1 and 360/);
  });

  it("the pass mark is optional but must be 0 to 100", () => {
    expect(validateMockForm(form({passingScore: ""}), pool)).toEqual([]);
    expect(validateMockForm(form({passingScore: "101"}), pool)[0]).toMatch(/pass mark/);
  });

  it("a draft may ask for more questions than the program has; publishing may not", () => {
    expect(validateMockForm(form({questionCount: "50"}), pool)).toEqual([]);
    expect(validateMockForm(form({questionCount: "50", published: true}), pool)[0]).toMatch(/only has 30 questions/);
  });

  it("a blueprint needs a module, and a published one cannot ask a module for more than it has", () => {
    expect(validateMockForm(form({useBlueprint: true}), pool)[0]).toMatch(/at least one module/);
    const f = form({useBlueprint: true, blueprint: {m2: "15"}});
    expect(validateMockForm(f, pool)).toEqual([]);
    expect(validateMockForm({...f, published: true}, pool)[0]).toMatch(/fewer questions/);
  });

  it("a fixed paper's questions each need text, two options and one right answer", () => {
    const f = form({mode: "fixed", questions: [question({question: ""}), question({options: [{id: "a", text: "x", isCorrect: false}]})]});
    const errors = validateMockForm(f, pool);
    expect(errors).toEqual(expect.arrayContaining([
      "Question 1 has no text.", "Question 2 needs at least two options.", "Question 2 needs a correct option.",
    ]));
  });

  it("a fixed paper cannot be published empty, and single choice has one right answer", () => {
    expect(validateMockForm(form({mode: "fixed", published: true}), pool)).toContain("Add at least one question before publishing.");
    const two = question({options: [{id: "a", text: "x", isCorrect: true}, {id: "b", text: "y", isCorrect: true}]});
    expect(validateMockForm(form({mode: "fixed", questions: [two]}), pool)[0]).toMatch(/several correct options/);
  });
});

describe("blueprint", () => {
  it("keeps modules with a count, in the pool's order, and totals them", () => {
    const f = form({useBlueprint: true, blueprint: {m2: "5", m1: "10", gone: "0", odd: "x"}});
    expect(blueprintItems(f, pool)).toEqual([{module_id: "m1", count: 10}, {module_id: "m2", count: 5}]);
    expect(blueprintTotal(f, pool)).toBe(15);
  });

  it("plans the question count from whichever way the paper is built", () => {
    expect(plannedQuestionCount(form({questionCount: "25"}), pool)).toBe(25);
    expect(plannedQuestionCount(form({useBlueprint: true, blueprint: {m1: "7", m2: "3"}}), pool)).toBe(10);
    expect(plannedQuestionCount(form({mode: "fixed", questions: [question(), question()]}), pool)).toBe(2);
    expect(plannedQuestionCount(form({questionCount: ""}), pool)).toBe(0);
  });
});

describe("mockPayload", () => {
  it("sends an auto paper's count, or its blueprint instead, never both", () => {
    const counted = mockPayload(form({questionCount: "25", passingScore: "60"}), pool);
    expect(counted).toMatchObject({mode: "auto", question_count: 25, blueprint: [], passing_score: 60, duration_minutes: 60, questions: []});
    const planned = mockPayload(form({useBlueprint: true, blueprint: {m1: "4"}}), pool);
    expect(planned).toMatchObject({question_count: null, blueprint: [{module_id: "m1", count: 4}]});
  });

  it("is paid only and unpublished by default, and a blank pass mark is null", () => {
    const p = mockPayload(form(), pool);
    expect(p).toMatchObject({paid_only: true, is_published: false, passing_score: null, shuffle_questions: true, shuffle_options: false});
  });

  it("sends a fixed paper's questions with their ids and responses, and no count", () => {
    const p = mockPayload(form({mode: "fixed", questions: [question()]}), pool);
    expect(p.question_count).toBeNull();
    expect(p.questions).toHaveLength(1);
    expect(p.questions[0]).toMatchObject({question_id: "q1", question_text: "2 + 2?", options: ["3", "4"], correct_answers: ["4"], option_feedback: [null, "Yes."]});
  });
});

describe("formFromDetail", () => {
  const detail = (over: Partial<ApiMockPaperDetail> = {}): ApiMockPaperDetail => ({
    paper_id: "p1", program_id: "x", title: "Mock", description: null, mode: "auto", duration_minutes: 90, passing_score: 50,
    question_count: 40, blueprint: [], shuffle_questions: true, shuffle_options: true, paid_only: false, is_published: true,
    order_index: 0, attempts: 0, available_questions: 100, questions: [], ...over,
  });

  it("round-trips an auto paper", () => {
    const f = formFromDetail(detail());
    expect(f).toMatchObject({title: "Mock", duration: "90", passingScore: "50", questionCount: "40", useBlueprint: false, paidOnly: false, published: true});
    expect(mockPayload(f, pool)).toMatchObject({question_count: 40, duration_minutes: 90, passing_score: 50, blueprint: []});
  });

  it("loads a blueprint paper with its counts", () => {
    const f = formFromDetail(detail({blueprint: [{module_id: "m1", count: 12}], question_count: 12}));
    expect(f.useBlueprint).toBe(true);
    expect(f.blueprint).toEqual({m1: "12"});
    expect(f.questionCount).toBe("");
  });

  it("loads a fixed paper's questions for the editor", () => {
    const f = formFromDetail(detail({
      mode: "fixed", question_count: 1,
      questions: [{
        question_id: "q1", question_text: "2 + 2?", description: null, question_type: "single_choice", options: ["3", "4"],
        correct_answers: ["4"], explanation: "Sum.", option_feedback: [null, "Yes."], order_index: 0, parent_id: "p1",
        parent_type: "mock_paper", usage_type: "mock", created_at: "",
      }],
    }));
    expect(f.questions).toHaveLength(1);
    expect(f.questions[0]).toMatchObject({id: "q1", question: "2 + 2?", explanation: "Sum."});
    expect(f.questions[0].options.map((o) => [o.text, o.isCorrect, o.response])).toEqual([["3", false, undefined], ["4", true, "Yes."]]);
  });
});
