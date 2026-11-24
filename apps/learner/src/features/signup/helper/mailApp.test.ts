import {describe, expect, it} from "vitest";
import {mailTarget} from "./mailApp";

describe("mailTarget", () => {
  it("opens the inbox of a known webmail provider in a new tab", () => {
    expect(mailTarget("ada@gmail.com")).toEqual({href: "https://mail.google.com/mail/u/0/#inbox", external: true});
    expect(mailTarget("ADA@Outlook.com").href).toContain("outlook.live.com");
    expect(mailTarget("ada@icloud.com").href).toContain("icloud.com/mail");
  });

  it("falls back to the phone's mail app for any other domain", () => {
    expect(mailTarget("taiwo@rhemaconnect.com")).toEqual({href: "mailto:", external: false});
    expect(mailTarget("")).toEqual({href: "mailto:", external: false});
    expect(mailTarget("not-an-email")).toEqual({href: "mailto:", external: false});
  });
});
