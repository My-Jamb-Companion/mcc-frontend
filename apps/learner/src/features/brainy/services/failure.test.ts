import {describe, expect, it} from "vitest";
import {chatReplyText, isRetryable, UNAVAILABLE_NOTICE, type ApiChatReply} from "./brainy.service";

const reply = (overrides: Partial<ApiChatReply>): ApiChatReply => ({
  chat_id: "c1",
  reply: "My brain is fuzzy right now. Please try again.",
  generated: false,
  ...overrides,
});

describe("isRetryable", () => {
  it("is retryable for a real answer", () => {
    expect(isRetryable(reply({generated: true, failure: null}))).toBe(true);
  });

  it("is retryable when the provider was merely busy", () => {
    expect(isRetryable(reply({failure: "busy"}))).toBe(true);
  });

  it("is not retryable when the same request will keep failing", () => {
    expect(isRetryable(reply({failure: "unavailable"}))).toBe(false);
  });

  it("stays retryable against an older backend that sends no failure field", () => {
    expect(isRetryable(reply({}))).toBe(true);
  });
});

describe("chatReplyText", () => {
  it("passes a real answer through untouched", () => {
    expect(chatReplyText(reply({generated: true, reply: "Photosynthesis is..."}))).toBe(
      "Photosynthesis is...",
    );
  });

  it("keeps the backend's busy wording for a transient failure", () => {
    expect(chatReplyText(reply({failure: "busy"}))).toBe(
      "My brain is fuzzy right now. Please try again.",
    );
  });

  it("replaces a misleading 'try again' when retrying cannot help", () => {
    expect(chatReplyText(reply({failure: "unavailable"}))).toBe(UNAVAILABLE_NOTICE);
  });
});
