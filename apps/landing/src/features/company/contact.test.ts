import { describe, expect, it } from "vitest";
import { contactChannels, whatsappHref } from "./contact";

describe("contactChannels", () => {
  it("lists only what is configured", () => {
    expect(contactChannels("", "")).toEqual([]);
    expect(contactChannels("help@example.com", "")).toEqual([
      { label: "Email", value: "help@example.com", href: "mailto:help@example.com" },
    ]);
    expect(contactChannels("", "+234 801 234 5678")).toEqual([
      { label: "WhatsApp", value: "+234 801 234 5678", href: "https://wa.me/2348012345678" },
    ]);
  });
  it("ignores a WhatsApp value with no digits", () => {
    expect(contactChannels("", "n/a")).toEqual([]);
  });
  it("builds a wa.me link from digits only", () => {
    expect(whatsappHref("+234 (801) 234-5678")).toBe("https://wa.me/2348012345678");
  });
});
