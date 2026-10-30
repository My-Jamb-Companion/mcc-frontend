import {describe, expect, it} from "vitest";
import {interpretZoneKey} from "./keys";

const state = {optionCount: 4, helpOpen: false};
const press = (key: string, extra: Record<string, unknown> = {}, s = state) => interpretZoneKey({key, ...extra}, s);
const target = (tagName: string, isContentEditable = false) => ({tagName, isContentEditable}) as unknown as EventTarget;

describe("Smart Zone keys", () => {
  it("picks an option with its letter or its number, in either case", () => {
    expect(press("a")).toEqual({type: "pick", index: 0});
    expect(press("C")).toEqual({type: "pick", index: 2});
    expect(press("2")).toEqual({type: "pick", index: 1});
  });

  it("ignores options the question does not have", () => {
    expect(press("e")).toBeNull();
    expect(press("5")).toBeNull();
    expect(press("e", {}, {optionCount: 6, helpOpen: false})).toEqual({type: "pick", index: 4});
    expect(press("6", {}, {optionCount: 6, helpOpen: false})).toEqual({type: "pick", index: 5});
  });

  it("maps the action keys", () => {
    expect(press("Enter")).toEqual({type: "primary"});
    expect(press("n")).toEqual({type: "next"});
    expect(press("p")).toEqual({type: "previous"});
    expect(press("h")).toEqual({type: "hint"});
    expect(press("s")).toEqual({type: "skip"});
    expect(press("m")).toEqual({type: "mute"});
    expect(press("?")).toEqual({type: "help"});
  });

  it("leaves other keys, held keys and browser shortcuts alone", () => {
    expect(press("x")).toBeNull();
    expect(press("Tab")).toBeNull();
    expect(press("ArrowDown")).toBeNull();
    expect(press("a", {repeat: true})).toBeNull();
    expect(press("a", {ctrlKey: true})).toBeNull();
    expect(press("r", {metaKey: true})).toBeNull();
    expect(press("a", {altKey: true})).toBeNull();
  });

  it("never takes letters typed into a text box", () => {
    expect(press("a", {target: target("TEXTAREA")})).toBeNull();
    expect(press("n", {target: target("INPUT")})).toBeNull();
    expect(press("s", {target: target("DIV", true)})).toBeNull();
  });

  it("still sends an answer with Enter from a one-line box, but not from a multi-line one", () => {
    expect(press("Enter", {target: target("INPUT")})).toEqual({type: "primary"});
    expect(press("Enter", {target: target("TEXTAREA")})).toBeNull();
  });

  it("takes a key pressed on a focused button, so Enter does not press it a second time", () => {
    expect(press("Enter", {target: target("BUTTON")})).toEqual({type: "primary"});
    expect(press("b", {target: target("BUTTON")})).toEqual({type: "pick", index: 1});
  });

  it("closes the guide with Esc and does nothing else while it is open", () => {
    const open = {optionCount: 4, helpOpen: true};
    expect(press("Escape", {}, open)).toEqual({type: "close"});
    expect(press("?", {}, open)).toEqual({type: "help"});
    expect(press("a", {}, open)).toBeNull();
    expect(press("Enter", {}, open)).toBeNull();
    expect(press("Escape")).toBeNull();
  });
});
