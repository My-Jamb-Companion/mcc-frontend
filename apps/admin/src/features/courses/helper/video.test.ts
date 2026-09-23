// @vitest-environment node
import {describe, expect, it} from "vitest";
import {isYouTubeUrl, youTubeEmbedUrl, youTubeVideoId} from "./video";

describe("youTubeVideoId", () => {
  it("extracts the id from a watch URL", () => {
    expect(youTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts the id from a watch URL with extra query params", () => {
    expect(youTubeVideoId("https://www.youtube.com/watch?list=abc&v=dQw4w9WgXcQ&t=10s")).toBe("dQw4w9WgXcQ");
  });

  it("extracts the id from a youtu.be short link", () => {
    expect(youTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts the id from an already-embed URL", () => {
    expect(youTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts the id from a Shorts URL", () => {
    expect(youTubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for a non-YouTube URL", () => {
    expect(youTubeVideoId("https://example.com/video.mp4")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(youTubeVideoId(undefined)).toBeNull();
    expect(youTubeVideoId(null)).toBeNull();
    expect(youTubeVideoId("")).toBeNull();
  });
});

describe("isYouTubeUrl", () => {
  it("is true for a YouTube URL and false otherwise", () => {
    expect(isYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(isYouTubeUrl("https://example.com/video.mp4")).toBe(false);
  });
});

describe("youTubeEmbedUrl", () => {
  it("builds a standard embed URL", () => {
    expect(youTubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("returns null for a non-YouTube URL", () => {
    expect(youTubeEmbedUrl("https://example.com/video.mp4")).toBeNull();
  });
});
