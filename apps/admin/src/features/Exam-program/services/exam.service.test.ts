import {describe, it, expect, vi, beforeEach} from "vitest";
import {apiClient} from "@mcc/api";
import {
  createExamProgram,
  deleteExamProgram,
  getApiErrorMessage,
  getExamProgram,
  listExamPrograms,
  publishExamProgram,
  unpublishExamProgram,
  updateExamProgramContent,
} from "./exam.service";

vi.mock("@mcc/api", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);
const mockDelete = vi.mocked(apiClient.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listExamPrograms", () => {
  const responseBody = {
    data: [
      {
        category_name: "Science",
        created_at: "2026-05-09 08:29:07.478405+00:00",
        exam_name: null,
        level: "intermediate",
        price: "4500.00",
        program_id: "prog_33053a83-daa7-4158-bce4-2522013b9f5e",
        rating: "0.00",
        status: "published",
        subject_name: "Maths",
        teacher_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        teacher_name: "Dr. John Doe",
      },
    ],
    message: "Exam programs retrieved",
    meta: {page: 1, per_page: 15, total: 1, total_pages: 1},
    success: true,
  };

  it("gets /admin/exams/programs with the given params", async () => {
    mockGet.mockResolvedValueOnce({data: responseBody});

    const params = {page: 1, status: "published" as const};
    await listExamPrograms(params);

    expect(mockGet).toHaveBeenCalledWith("/admin/exams/programs", {params});
  });

  it("returns the response envelope as-is", async () => {
    mockGet.mockResolvedValueOnce({data: responseBody});

    const result = await listExamPrograms();

    expect(result).toEqual(responseBody);
  });

  it("propagates errors from the API client", async () => {
    mockGet.mockRejectedValueOnce(new Error("network error"));

    await expect(listExamPrograms()).rejects.toThrow("network error");
  });
});

describe("getExamProgram", () => {
  const programId = "prog_33053a83-daa7-4158-bce4-2522013b9f5e";
  const programDetail = {
    category_id: "cat_5cb409c0",
    cover_image_url: "https://storage.com/math/exam_cover.jpg",
    created_at: "Sat, 09 May 2026 08:29:07 GMT",
    description:
      "Comprehensive guide to JAMB Mathematics, covering Algebra to Calculus.",
    exam_id: "exam_863a0f2d",
    learning_outcomes: [
      "Master Quadratic Equations",
      "Understand Trigonometry",
    ],
    level: "intermediate",
    price: "4500.00",
    program_id: programId,
    promo_video_url: "https://storage.com/math/exam_promo.mp4",
    published_at: "Sat, 09 May 2026 08:29:45 GMT",
    rating: "0.00",
    status: "published",
    subject_id: "subj_7cbabae5",
    tags: ["Math", "JAMB", "2024"],
    teacher_id: "teacher_001",
    topics: [
      {
        created_at: "Sat, 09 May 2026 08:29:17 GMT",
        order_index: 0,
        program_id: programId,
        sub_topics: [
          {
            created_at: "Sat, 09 May 2026 08:29:17 GMT",
            description: "Learn how to convert from Base 10 to Base 2.",
            modules: [
              {
                created_at: "Sat, 09 May 2026 08:29:17 GMT",
                lectures: [
                  {
                    created_at: "Sat, 09 May 2026 08:29:17 GMT",
                    file_size_bytes: 52428800,
                    lecture_id: "lec_b352fe03",
                    module_id: "mod_6461e4cc",
                    order_index: 0,
                    title: "Intro to Binary",
                    video_url: "https://video.com/lec1.mp4",
                  },
                ],
                module_id: "mod_6461e4cc",
                order_index: 0,
                practices: [
                  {
                    correct_answers: ["111"],
                    created_at: "Sat, 09 May 2026 08:29:17 GMT",
                    description: null,
                    explanation: "7 in binary is 111 (4 + 2 + 1).",
                    options: ["111", "110", "101"],
                    order_index: 0,
                    parent_id: "mod_6461e4cc",
                    parent_type: "module",
                    question_id: "q_355b8082",
                    question_text: "Practice: Convert 7 to Binary.",
                    question_type: "single_choice",
                    usage_type: "practice",
                  },
                ],
                quizzes: [
                  {
                    correct_answers: ["101"],
                    created_at: "Sat, 09 May 2026 08:29:17 GMT",
                    description: null,
                    explanation: "5 in binary is 101 (4 + 0 + 1).",
                    options: ["101", "110", "011"],
                    order_index: 0,
                    parent_id: "mod_6461e4cc",
                    parent_type: "module",
                    question_id: "q_1b8b79d6",
                    question_text: "Convert 5 to Base 2.",
                    question_type: "single_choice",
                    usage_type: "quiz",
                  },
                ],
                sub_topic_id: "st_b58c7119",
                title: "Module 1: Basic Conversions",
              },
            ],
            order_index: 0,
            sub_topic_id: "st_b58c7119",
            test_exercises: [
              {
                correct_answers: ["1010"],
                created_at: "Sat, 09 May 2026 08:29:17 GMT",
                description: null,
                explanation:
                  "10 divided by 2 repeatedly gives remainders 0, 1, 0, 1.",
                options: ["1010", "1100", "1001"],
                order_index: 0,
                parent_id: "st_b58c7119",
                parent_type: "sub_topic",
                question_id: "q_992ceb46",
                question_text: "What is 10 in Binary?",
                question_type: "single_choice",
                usage_type: "test",
              },
            ],
            title: "Conversion between Bases",
            topic_id: "topic_cda88405",
          },
        ],
        title: "Number Bases",
        topic_id: "topic_cda88405",
      },
    ],
    updated_at: "Sat, 09 May 2026 08:29:45 GMT",
  };

  it("gets /admin/exams/programs/{program_id}", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Exam program details retrieved",
        data: programDetail,
      },
    });

    await getExamProgram(programId);

    expect(mockGet).toHaveBeenCalledWith(
      `/admin/exams/programs/${programId}`,
    );
  });

  it("returns the program detail from the response envelope", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Exam program details retrieved",
        data: programDetail,
      },
    });

    const result = await getExamProgram(programId);

    expect(result).toEqual(programDetail);
  });

  it("propagates errors from the API client", async () => {
    mockGet.mockRejectedValueOnce(new Error("network error"));

    await expect(getExamProgram(programId)).rejects.toThrow("network error");
  });
});

describe("createExamProgram", () => {
  const payload = {
    exam: "JAMB",
    subject: "Mathematics",
    category: "Science",
    teacher_id: "teacher_001",
    description:
      "Comprehensive guide to JAMB Mathematics, covering Algebra to Calculus.",
    price: 4500,
    level: "intermediate",
    tags: ["Math", "JAMB", "2024"],
    learning_outcomes: [
      "Master Quadratic Equations",
      "Understand Trigonometry",
    ],
  };

  it("posts to /admin/exams/programs with the given payload", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Exam program created successfully",
        data: {program_id: "prog_6b9c3e8f-ea80-4171-9428-b7cc9d62c66c"},
      },
    });

    await createExamProgram(payload);

    expect(mockPost).toHaveBeenCalledWith("/admin/exams/programs", payload);
  });

  it("returns the created program id from the response envelope", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Exam program created successfully",
        data: {program_id: "prog_6b9c3e8f-ea80-4171-9428-b7cc9d62c66c"},
      },
    });

    const result = await createExamProgram(payload);

    expect(result).toEqual({
      program_id: "prog_6b9c3e8f-ea80-4171-9428-b7cc9d62c66c",
    });
  });

  it("propagates errors from the API client", async () => {
    mockPost.mockRejectedValueOnce(new Error("network error"));

    await expect(createExamProgram(payload)).rejects.toThrow("network error");
  });
});

describe("updateExamProgramContent", () => {
  const programId = "prog_6b9c3e8f-ea80-4171-9428-b7cc9d62c66c";
  const payload = {
    topics: [
      {
        title: "Number Bases",
        sub_topics: [
          {
            title: "Conversion between Bases",
            description: "Learn how to convert from Base 10 to Base 2.",
            test_exercises: [
              {
                question_text: "What is 10 in Binary?",
                question_type: "single_choice" as const,
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
                quizzes: [
                  {
                    question_text: "Convert 5 to Base 2.",
                    question_type: "single_choice" as const,
                    options: ["101", "110", "011"],
                    correct_answers: ["101"],
                    explanation: "5 in binary is 101 (4 + 0 + 1).",
                  },
                ],
                practices: [
                  {
                    question_text: "Practice: Convert 7 to Binary.",
                    question_type: "single_choice" as const,
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
    ],
  };

  it("patches /admin/exams/programs/{program_id} with the given payload", async () => {
    mockPatch.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Exam program updated successfully",
        data: {program_id: programId, status: "draft"},
      },
    });

    await updateExamProgramContent(programId, payload);

    expect(mockPatch).toHaveBeenCalledWith(
      `/admin/exams/programs/${programId}`,
      payload,
    );
  });

  it("returns the program id and status from the response envelope", async () => {
    mockPatch.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Exam program updated successfully",
        data: {program_id: programId, status: "draft"},
      },
    });

    const result = await updateExamProgramContent(programId, payload);

    expect(result).toEqual({program_id: programId, status: "draft"});
  });

  it("propagates errors from the API client", async () => {
    mockPatch.mockRejectedValueOnce(new Error("network error"));

    await expect(
      updateExamProgramContent(programId, payload),
    ).rejects.toThrow("network error");
  });
});

describe("publishExamProgram", () => {
  const programId = "prog_6b9c3e8f-ea80-4171-9428-b7cc9d62c66c";

  it("posts to /admin/exams/programs/{program_id}/publish", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Exam program published successfully",
        data: {program_id: programId, status: "published"},
      },
    });

    await publishExamProgram(programId);

    expect(mockPost).toHaveBeenCalledWith(
      `/admin/exams/programs/${programId}/publish`,
    );
  });

  it("returns the program id and published status from the response envelope", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Exam program published successfully",
        data: {program_id: programId, status: "published"},
      },
    });

    const result = await publishExamProgram(programId);

    expect(result).toEqual({program_id: programId, status: "published"});
  });

  it("propagates errors from the API client", async () => {
    mockPost.mockRejectedValueOnce(new Error("network error"));

    await expect(publishExamProgram(programId)).rejects.toThrow(
      "network error",
    );
  });
});

describe("unpublishExamProgram", () => {
  const programId = "prog_6b9c3e8f-ea80-4171-9428-b7cc9d62c66c";

  it("posts to /admin/exams/programs/{program_id}/unpublish", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Exam program unpublished successfully",
        data: {program_id: programId, status: "draft"},
      },
    });

    await unpublishExamProgram(programId);

    expect(mockPost).toHaveBeenCalledWith(
      `/admin/exams/programs/${programId}/unpublish`,
    );
  });

  it("returns the program id and draft status from the response envelope", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Exam program unpublished successfully",
        data: {program_id: programId, status: "draft"},
      },
    });

    const result = await unpublishExamProgram(programId);

    expect(result).toEqual({program_id: programId, status: "draft"});
  });

  it("propagates errors from the API client", async () => {
    mockPost.mockRejectedValueOnce(new Error("network error"));

    await expect(unpublishExamProgram(programId)).rejects.toThrow(
      "network error",
    );
  });
});

describe("deleteExamProgram", () => {
  const programId = "prog_6b9c3e8f-ea80-4171-9428-b7cc9d62c66c";

  it("deletes /admin/exams/programs/{program_id}", async () => {
    mockDelete.mockResolvedValueOnce({
      data: {success: true, message: "Exam program deleted successfully"},
    });

    await deleteExamProgram(programId);

    expect(mockDelete).toHaveBeenCalledWith(
      `/admin/exams/programs/${programId}`,
    );
  });

  it("returns the response envelope", async () => {
    mockDelete.mockResolvedValueOnce({
      data: {success: true, message: "Exam program deleted successfully"},
    });

    const result = await deleteExamProgram(programId);

    expect(result).toEqual({
      success: true,
      message: "Exam program deleted successfully",
    });
  });

  it("propagates errors from the API client", async () => {
    mockDelete.mockRejectedValueOnce(new Error("network error"));

    await expect(deleteExamProgram(programId)).rejects.toThrow(
      "network error",
    );
  });
});

describe("getApiErrorMessage", () => {
  it("extracts the message from an Axios-style error response", () => {
    const error = {response: {data: {message: "Invalid teacher_id"}}};
    expect(getApiErrorMessage(error, "fallback")).toBe("Invalid teacher_id");
  });

  it("falls back to the Error message when there is no response payload", () => {
    expect(getApiErrorMessage(new Error("boom"), "fallback")).toBe("boom");
  });

  it("falls back to the provided default for unrecognized errors", () => {
    expect(getApiErrorMessage("oops", "fallback")).toBe("fallback");
  });
});
