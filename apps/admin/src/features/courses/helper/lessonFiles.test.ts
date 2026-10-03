import {describe, expect, it} from "vitest";
import {
  LESSON_FILE_CAPTION,
  lessonFileKind,
  lessonFileProblem,
  MAX_LESSON_FILE_BYTES,
  splitLessonFiles,
} from "./lessonFiles";
import {isPdfUrl} from "./video";

const f = (name: string, type = "", size = 1000) => ({name, type, size});

describe("lessonFileKind", () => {
  it("accepts MP4 and PDF by extension or type, in any case", () => {
    expect(lessonFileKind(f("a.mp4"))).toBe("mp4");
    expect(lessonFileKind(f("A.MP4"))).toBe("mp4");
    expect(lessonFileKind(f("blob", "video/mp4"))).toBe("mp4");
    expect(lessonFileKind(f("notes.pdf"))).toBe("pdf");
    expect(lessonFileKind(f("blob", "application/pdf"))).toBe("pdf");
  });

  it("rejects everything else", () => {
    for (const name of ["a.mov", "a.webm", "a.avi", "a.png", "a.docx", "a"]) {
      expect(lessonFileKind(f(name))).toBeNull();
    }
  });
});

describe("lessonFileProblem", () => {
  it("names the file and the rule", () => {
    expect(lessonFileProblem(f("clip.mov"))).toBe("clip.mov isn't an MP4 or PDF file.");
    expect(lessonFileProblem(f("big.mp4", "", 612 * 1024 * 1024))).toBe("big.mp4 is 612 MB; the limit is 500 MB.");
  });

  it("allows a file exactly at the limit, and none over it", () => {
    expect(lessonFileProblem(f("ok.mp4", "", MAX_LESSON_FILE_BYTES))).toBeNull();
    expect(lessonFileProblem(f("no.mp4", "", MAX_LESSON_FILE_BYTES + 1))).not.toBeNull();
  });
});

describe("splitLessonFiles", () => {
  it("keeps the good files and explains the rest", () => {
    const good = new File(["x"], "a.mp4", {type: "video/mp4"});
    const bad = new File(["x"], "b.mov");
    const {accepted, problems} = splitLessonFiles([good, bad]);
    expect(accepted).toEqual([good]);
    expect(problems).toEqual(["b.mov isn't an MP4 or PDF file."]);
  });
});

describe("the caption", () => {
  it("states the types and the size", () => {
    expect(LESSON_FILE_CAPTION).toBe("MP4 video or PDF files, up to 500 MB each.");
  });
});

describe("isPdfUrl", () => {
  it("recognises uploaded PDFs, with or without a query string", () => {
    expect(isPdfUrl("https://cdn/x/abc-Notes.pdf")).toBe(true);
    expect(isPdfUrl("https://cdn/x/abc-Notes.PDF?sig=1")).toBe(true);
    expect(isPdfUrl("https://cdn/x/abc-video.mp4")).toBe(false);
    expect(isPdfUrl("https://cdn/x/pdf-guide.mp4")).toBe(false);
    expect(isPdfUrl(null)).toBe(false);
  });
});
