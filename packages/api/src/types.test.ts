import { describe, it, expect } from "vitest";
import { extractApiError } from "./types";

describe("extractApiError", () => {
  // TC-1.1
  it("extracts the message from a well-formed API error", () => {
    const error = {
      response: {
        data: {
          success: false,
          message: "Invalid credentials",
          error: { code: "AUTH_001" },
        },
      },
    };

    expect(extractApiError(error)).toBe("Invalid credentials");
  });

  // TC-1.2
  it("returns fallback when the error has no response property", () => {
    const error = new Error("Network Error");

    expect(extractApiError(error)).toBe("Something went wrong");
  });

  // TC-1.3
  it("returns fallback when response.data has no message field", () => {
    const error = {
      response: {
        data: {
          success: false,
          // no message field
        },
      },
    };

    expect(extractApiError(error)).toBe("Something went wrong");
  });

  // TC-1.4
  it("returns fallback when error is null", () => {
    expect(extractApiError(null)).toBe("Something went wrong");
  });

  // TC-1.5
  it("uses a custom fallback message when provided", () => {
    expect(extractApiError(null, "Login failed")).toBe("Login failed");
  });
});
