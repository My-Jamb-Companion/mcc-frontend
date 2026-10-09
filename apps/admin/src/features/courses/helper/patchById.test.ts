import {describe, expect, it} from "vitest";
import {patchById} from "./patchById";

const tree = [
  {id: "t1", modules: [{id: "m1", content: [{id: "a", title: "A", src: "blob:a"}, {id: "b", title: "B"}]}]},
  {id: "t2", modules: [{id: "m2", content: [{id: "c", title: "C"}]}]},
];

describe("patchById", () => {
  it("updates only the lesson with that id, wherever it is", () => {
    const next = patchById(tree, "c", {src: "https://cdn/c"});
    expect(next[1].modules[0].content[0]).toEqual({id: "c", title: "C", src: "https://cdn/c"});
    expect(next[0]).toBe(tree[0]);
  });

  it("keeps everything else exactly as it is, including lessons added since", () => {
    const grown = [{...tree[0], modules: [{...tree[0].modules[0], content: [...tree[0].modules[0].content, {id: "d", title: "D"}]}]}, tree[1]];
    const next = patchById(grown, "a", {src: "https://cdn/a"});
    expect(next[0].modules[0].content.map((c) => c.id)).toEqual(["a", "b", "d"]);
    expect(next[0].modules[0].content[0].src).toBe("https://cdn/a");
  });

  it("returns the same tree when nothing has that id (the lesson was deleted meanwhile)", () => {
    expect(patchById(tree, "gone", {src: "x"})).toBe(tree);
  });

  it("does not look inside a File", () => {
    const file = new File(["x"], "x.pdf");
    const withFile = [{id: "a", file}];
    expect(patchById(withFile, "zzz", {})).toBe(withFile);
    expect(patchById(withFile, "a", {src: "u"})[0].file).toBe(file);
  });
});
