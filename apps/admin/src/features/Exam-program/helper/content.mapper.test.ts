import {describe, it, expect} from "vitest";
import {serializeTopicsPayload, toApiQuestionType} from "./content.mapper";
import {Topic} from "../components/CreateProgramSteps/Step2";
import {CreatPracticeQuestionType} from "../components/CreateProgramSteps/PracticeQuestions";
import {FileRow} from "../components/CreateProgramSteps/LessonsCreate";

function makeQuestion(
  overrides: Partial<CreatPracticeQuestionType> = {},
): CreatPracticeQuestionType {
  return {
    id: "q1",
    type: "single",
    question: "What is 10 in Binary?",
    options: [
      {id: "a", text: "1010", isCorrect: true},
      {id: "b", text: "1100", isCorrect: false},
      {id: "c", text: "1001", isCorrect: false},
    ],
    explanation: "10 divided by 2 repeatedly gives remainders 0, 1, 0, 1.",
    ...overrides,
  };
}

function makeLecture(overrides: Partial<FileRow> = {}): FileRow {
  return {
    id: "lec1",
    title: "Intro to Binary",
    format: "MP4",
    size: "50.0mb",
    src: "https://video.com/lec1.mp4",
    file: {size: 52428800} as File,
    ...overrides,
  };
}

describe("toApiQuestionType", () => {
  it("maps 'single' to 'single_choice'", () => {
    expect(toApiQuestionType("single")).toBe("single_choice");
  });

  it("maps 'multiple' to 'multi_choice'", () => {
    expect(toApiQuestionType("multiple")).toBe("multi_choice");
  });
});

describe("serializeTopicsPayload", () => {
  it("serializes a full topic -> sub-topic -> module tree", () => {
    const topics: Topic[] = [
      {
        id: "t1",
        label: "Number Bases",
        subTopics: [
          {
            id: "s1",
            label: "Conversion between Bases",
            description: "Learn how to convert from Base 10 to Base 2.",
            hasQuiz: true,
            quizQuestions: [makeQuestion()],
            modules: [
              {
                id: "m1",
                label: "Module 1: Basic Conversions",
                leaves: [
                  {
                    id: "l1",
                    label: "Lectures",
                    type: "lectures",
                    lessons: [makeLecture()],
                  },
                  {
                    id: "l2",
                    label: "Practice",
                    type: "practice",
                    questions: [
                      makeQuestion({
                        id: "q2",
                        question: "Practice: Convert 7 to Binary.",
                        options: [
                          {id: "a", text: "111", isCorrect: true},
                          {id: "b", text: "110", isCorrect: false},
                          {id: "c", text: "101", isCorrect: false},
                        ],
                        explanation: "7 in binary is 111 (4 + 2 + 1).",
                      }),
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const payload = serializeTopicsPayload(topics);

    expect(payload).toEqual([
      {
        title: "Number Bases",
        sub_topics: [
          {
            title: "Conversion between Bases",
            description: "Learn how to convert from Base 10 to Base 2.",
            test_exercises: [
              {
                question_text: "What is 10 in Binary?",
                question_type: "single_choice",
                options: ["1010", "1100", "1001"],
                correct_answers: ["1010"],
                explanation:
                  "10 divided by 2 repeatedly gives remainders 0, 1, 0, 1.",
              },
            ],
            modules: [
              {
                title: "Module 1: Basic Conversions",
                lectures: [
                  {
                    title: "Intro to Binary",
                    video_url: "https://video.com/lec1.mp4",
                    file_size_bytes: 52428800,
                  },
                ],
                quizzes: [],
                practices: [
                  {
                    question_text: "Practice: Convert 7 to Binary.",
                    question_type: "single_choice",
                    options: ["111", "110", "101"],
                    correct_answers: ["111"],
                    explanation: "7 in binary is 111 (4 + 2 + 1).",
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("omits test_exercises when the sub-topic has no quiz enabled", () => {
    const topics: Topic[] = [
      {
        id: "t1",
        label: "Topic",
        subTopics: [
          {
            id: "s1",
            label: "Sub-topic",
            hasQuiz: false,
            quizQuestions: [makeQuestion()],
            modules: [],
          },
        ],
      },
    ];

    const [topic] = serializeTopicsPayload(topics);
    expect(topic.sub_topics[0].test_exercises).toEqual([]);
  });

  it("falls back to a preview URL and 'Untitled' labels when data is missing", () => {
    const topics: Topic[] = [
      {
        id: "t1",
        label: "",
        subTopics: [
          {
            id: "s1",
            label: "",
            modules: [
              {
                id: "m1",
                label: "",
                leaves: [
                  {
                    id: "l1",
                    label: "Lectures",
                    type: "lectures",
                    lessons: [
                      makeLecture({
                        src: undefined,
                        previewUrl: "blob:local-preview",
                        file: undefined,
                      }),
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const payload = serializeTopicsPayload(topics);
    expect(payload[0].title).toBe("Untitled topic");
    expect(payload[0].sub_topics[0].title).toBe("Untitled sub-topic");
    expect(payload[0].sub_topics[0].modules[0].title).toBe("Untitled Module");
    expect(payload[0].sub_topics[0].modules[0].lectures[0]).toEqual({
      title: "Intro to Binary",
      video_url: "blob:local-preview",
      file_size_bytes: undefined,
    });
  });
});
