import {describe, expect, it} from "vitest";
import {isContentChanged, withBaseVersion} from "./contentSave";

describe("withBaseVersion", () => {
  const payload = {topics: []};

  it("adds the version the editor holds, including zero for a new program", () => {
    expect(withBaseVersion(payload, 3)).toEqual({topics: [], base_content_version: 3});
    expect(withBaseVersion(payload, 0)).toEqual({topics: [], base_content_version: 0});
  });

  it("sends none when the editor has none (an older copy of the page)", () => {
    expect(withBaseVersion(payload, null)).toBe(payload);
    expect(withBaseVersion(payload, undefined)).toBe(payload);
  });

  it("does not change the payload it was given", () => {
    withBaseVersion(payload, 2);
    expect(payload).toEqual({topics: []});
  });
});

describe("isContentChanged", () => {
  const response = (data: unknown) => ({response: {status: 409, data}});

  it("recognises the server's refusal", () => {
    expect(isContentChanged(response({success: false, error: {code: "CONTENT_CHANGED"}}))).toBe(true);
  });

  it("does not mistake other conflicts or failures for it", () => {
    expect(isContentChanged(response({error: {code: "ALREADY_EXISTS"}}))).toBe(false);
    expect(isContentChanged(new Error("Network Error"))).toBe(false);
    expect(isContentChanged(undefined)).toBe(false);
  });
});
