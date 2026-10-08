import {describe, expect, it} from "vitest";
import {idTypeLabel, isPdfLink, maskAccount, ninCheckNote, sortQueue} from "./verification";
import type {ApiVerification} from "../services/verifications.service";

const v = (id: string, o: Partial<ApiVerification> = {}): ApiVerification => ({
  id, teacher_user_id: "t", teacher_name: "T", teacher_email: "t@x.com", id_type: "passport", id_number: "A1",
  nin_verification_status: "verified", status: "pending", reviewed_by: null, reviewed_at: null, rejection_reason: null,
  created_at: "2026-01-01T00:00:00Z", id_document_url: "https://x/y.jpg", teaching_certificate_url: null, selfie_url: "https://x/s.jpg", ...o,
});

describe("verification helpers", () => {
  it("names ID types, falling back to the raw value", () => {
    expect(idTypeLabel("drivers_license")).toBe("Driver's licence");
    expect(idTypeLabel("mystery")).toBe("mystery");
  });

  it("tells a PDF link from an image, query strings included", () => {
    expect(isPdfLink("https://s3/doc.pdf?X-Amz-Signature=abc")).toBe(true);
    expect(isPdfLink("https://s3/doc.PDF")).toBe(true);
    expect(isPdfLink("https://s3/selfie.jpg?sig=1")).toBe(false);
  });

  it("explains the NIN check", () => {
    expect(ninCheckNote("verified").tone).toBe("good");
    expect(ninCheckNote("unavailable")).toMatchObject({tone: "warn"});
  });

  it("keeps pending first and resolved newest first", () => {
    const sorted = sortQueue([
      v("old-done", {status: "approved", reviewed_at: "2026-02-01T00:00:00Z"}),
      v("p1"),
      v("new-done", {status: "rejected", reviewed_at: "2026-03-01T00:00:00Z"}),
      v("p2"),
    ]);
    expect(sorted.map((x) => x.id)).toEqual(["p1", "p2", "new-done", "old-done"]);
  });

  it("masks an account number but for the last four digits", () => {
    expect(maskAccount("0123456789")).toBe("••••••6789");
    expect(maskAccount("12")).toBe("12");
    expect(maskAccount(null)).toBe("");
  });
});
