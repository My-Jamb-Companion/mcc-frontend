import {describe, expect, it} from "vitest";
import {chatLink} from "./chat";

describe("chatLink", () => {
  it("opens the support number with a message that says who is writing", () => {
    const link = chatLink("https://wa.me/2348012345678", {name: "Ada Obi", email: "ada@x.com"})!;
    expect(link.startsWith("https://wa.me/2348012345678?text=")).toBe(true);
    expect(decodeURIComponent(link.split("text=")[1])).toBe("Hi MCC, I'm Ada Obi (ada@x.com). I need some help with ");
  });
  it("copes with a missing name or email", () => {
    expect(decodeURIComponent(chatLink("https://wa.me/1", {})!.split("text=")[1])).toBe("Hi MCC, I need some help with ");
    expect(decodeURIComponent(chatLink("https://wa.me/1", {name: "Ada"})!.split("text=")[1])).toBe("Hi MCC, I'm Ada. I need some help with ");
  });
  it("gives no link when support has no number configured", () => {
    expect(chatLink(null, {name: "Ada"})).toBeNull();
    expect(chatLink("", {})).toBeNull();
  });
});
