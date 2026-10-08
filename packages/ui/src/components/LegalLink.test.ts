import {afterEach, describe, expect, it, vi} from "vitest";
import {legalUrl} from "./LegalLink";

afterEach(() => vi.unstubAllEnvs());

describe("legalUrl", () => {
  it("points at the legal pages on the landing site", () => {
    vi.stubEnv("NEXT_PUBLIC_LANDING_URL", "https://www.example.com/");
    expect(legalUrl("terms")).toBe("https://www.example.com/terms");
    expect(legalUrl("privacy")).toBe("https://www.example.com/privacy");
    expect(legalUrl("refund")).toBe("https://www.example.com/refund");
  });

  it("falls back to the local landing server", () => {
    vi.stubEnv("NEXT_PUBLIC_LANDING_URL", "");
    expect(legalUrl("terms")).toBe("http://localhost:3004/terms");
  });
});
