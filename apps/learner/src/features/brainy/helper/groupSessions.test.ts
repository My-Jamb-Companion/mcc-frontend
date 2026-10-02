import {describe, expect, it} from "vitest";
import {
  LEGACY_GROUPS,
  resolveGroupId,
  sessionsByGroup,
  splitPinned,
  type SidebarGroup,
} from "./groupSessions";

const groups: SidebarGroup[] = [
  {id: "g-r", name: "Science", kind: "research"}, // a renamed default
  {id: "g-a", name: "Assignment", kind: "assignment"},
  {id: "g-e", name: "Exam Study", kind: "exam"},
  {id: "g-c", name: "Biology", kind: null},
];

const chat = (id: string, mode: string, extra = {}) => ({id, mode, ...extra});

describe("resolveGroupId", () => {
  it("uses the chat's own group when it exists", () => {
    expect(resolveGroupId(chat("1", "research", {groupId: "g-c"}), groups)).toBe("g-c");
  });

  it("falls back to the default group for the chat's mode", () => {
    expect(resolveGroupId(chat("1", "exam"), groups)).toBe("g-e");
  });

  it("still finds a renamed default group, because it matches on kind not name", () => {
    expect(resolveGroupId(chat("1", "research"), groups)).toBe("g-r");
  });

  it("falls back by mode when the chat points at a group this client doesn't know", () => {
    expect(resolveGroupId(chat("1", "assignment", {groupId: "deleted"}), groups)).toBe("g-a");
  });

  it("never loses a chat even with an unknown mode", () => {
    expect(resolveGroupId(chat("1", "weird"), groups)).toBe("g-r");
  });
});

describe("sessionsByGroup", () => {
  it("lists every group, including empty ones, and places each chat once", () => {
    const result = sessionsByGroup(
      [chat("1", "research"), chat("2", "exam"), chat("3", "research", {groupId: "g-c"})],
      groups,
    );
    expect(result.get("g-r")!.map((s) => s.id)).toEqual(["1"]);
    expect(result.get("g-e")!.map((s) => s.id)).toEqual(["2"]);
    expect(result.get("g-c")!.map((s) => s.id)).toEqual(["3"]);
    expect(result.get("g-a")).toEqual([]);
  });

  it("works against the legacy fallback groups", () => {
    const result = sessionsByGroup([chat("1", "assignment")], LEGACY_GROUPS);
    expect(result.get("legacy-assignment")!.map((s) => s.id)).toEqual(["1"]);
  });
});

describe("splitPinned", () => {
  it("puts the most recently pinned chat first and leaves the rest alone", () => {
    const older = new Date("2026-10-01");
    const newer = new Date("2026-10-02");
    const { pinned, rest } = splitPinned([
      chat("a", "research"),
      chat("b", "research", {pinned: true, pinnedAt: older}),
      chat("c", "research", {pinned: true, pinnedAt: newer}),
    ]);
    expect(pinned.map((s) => s.id)).toEqual(["c", "b"]);
    expect(rest.map((s) => s.id)).toEqual(["a"]);
  });

  it("returns no pinned block when nothing is pinned", () => {
    expect(splitPinned([chat("a", "research")]).pinned).toEqual([]);
  });
});
