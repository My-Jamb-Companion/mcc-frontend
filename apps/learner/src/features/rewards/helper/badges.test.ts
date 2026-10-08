import {describe, expect, it} from "vitest";
import {sortBadges} from "./badges";
import type {ApiBadge} from "../services/rewards.service";

const badge = (key: string, o: Partial<ApiBadge> = {}): ApiBadge => ({
  key, name: key, description: "", target: 10, progress: 0, earned: false, earned_at: null, ...o,
});

describe("sortBadges", () => {
  it("puts earned badges first, newest earned first, then the closest to earning", () => {
    const sorted = sortBadges([
      badge("far", {progress: 1}),
      badge("old", {earned: true, earned_at: "2026-01-01T00:00:00Z", progress: 10}),
      badge("close", {progress: 9}),
      badge("new", {earned: true, earned_at: "2026-06-01T00:00:00Z", progress: 10}),
    ]);
    expect(sorted.map((b) => b.key)).toEqual(["new", "old", "close", "far"]);
  });

  it("does not change the list it is given", () => {
    const input = [badge("a"), badge("b", {earned: true})];
    sortBadges(input);
    expect(input.map((b) => b.key)).toEqual(["a", "b"]);
  });
});
