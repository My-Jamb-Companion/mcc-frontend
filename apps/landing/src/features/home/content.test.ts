import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultContent } from "@mcc/landing-content";
import { getLandingContent } from "./content";

afterEach(() => vi.unstubAllGlobals());

const reply = (body: unknown, ok = true) => vi.fn().mockResolvedValue({ ok, json: async () => body });

describe("getLandingContent", () => {
  it("returns what was published", async () => {
    vi.stubGlobal("fetch", reply({ data: { content: { site: { brand_name: "Learnly" }, blocks: [{ id: "a", type: "faq", visible: true, data: {} }] } } }));
    const page = await getLandingContent();
    expect(page.site.brand_name).toBe("Learnly");
    expect(page.blocks.map((b) => b.id)).toEqual(["a"]);
  });

  it("falls back to the built-in design when nothing is published", async () => {
    vi.stubGlobal("fetch", reply({ data: { content: null } }));
    expect(await getLandingContent()).toEqual(defaultContent());
  });

  it("falls back when the API errors or is unreachable", async () => {
    vi.stubGlobal("fetch", reply({}, false));
    expect(await getLandingContent()).toEqual(defaultContent());
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await getLandingContent()).toEqual(defaultContent());
  });

  it("asks for a refresh at most every minute", async () => {
    const fetchMock = reply({ data: { content: null } });
    vi.stubGlobal("fetch", fetchMock);
    await getLandingContent();
    expect(fetchMock.mock.calls[0][1].next.revalidate).toBe(60);
  });
});
