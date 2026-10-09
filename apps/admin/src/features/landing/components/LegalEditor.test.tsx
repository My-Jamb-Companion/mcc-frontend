// @vitest-environment jsdom
/**
 * The legal pages editor: each of Terms, Privacy and Refund opens from its built-in text, saves its own
 * draft, publishes its own version, and switching pages never silently throws away unsaved edits.
 */
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {DOCUMENTS} from "@mcc/landing-content";
import LegalEditor from "./LegalEditor";
import * as service from "../services/landing.service";

vi.mock("@mcc/ui", async (importOriginal) => ({...(await importOriginal<typeof import("@mcc/ui")>()), Icon: () => null}));
vi.mock("@/src/features/admin-access/hooks/useAdminAccess", () => ({useMyAccess: () => ({data: undefined})}));
vi.mock("../services/landing.service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/landing.service")>()),
  getLandingPage: vi.fn(),
  saveLandingDraft: vi.fn(),
  publishLandingPage: vi.fn(),
}));

const state = (page: string, over: Record<string, unknown> = {}) => ({
  page_key: page, draft: null, published: null, has_unpublished_changes: false, ...over,
});

function renderEditor() {
  return render(
    <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}, mutations: {retry: false}}})}>
      <LegalEditor />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(service.getLandingPage).mockImplementation(async (page = "home") => state(page) as never);
  vi.mocked(service.saveLandingDraft).mockImplementation(async (content, _rev, page) =>
    ({version_id: "v1", status: "draft", content, revision: 1, note: null, published_by: null, created_at: "", updated_at: "", published_at: null, page}) as never);
  vi.mocked(service.publishLandingPage).mockResolvedValue({} as never);
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LegalEditor", () => {
  it("opens Terms from the built-in text, one section per heading", async () => {
    renderEditor();
    expect(await screen.findByRole("heading", {name: "Terms of Use", level: 1})).toBeTruthy();
    expect(vi.mocked(service.getLandingPage).mock.calls[0][0]).toBe("terms");
    expect(screen.getAllByText(DOCUMENTS.terms.sections[0].heading).length).toBeGreaterThan(0);
    expect(screen.getByRole("status").textContent).toMatch(/built-in text/);
  });

  it("loads the page of whichever tab is chosen", async () => {
    renderEditor();
    await screen.findByRole("heading", {name: "Terms of Use", level: 1});
    fireEvent.click(screen.getByRole("tab", {name: "Privacy Policy"}));
    expect(await screen.findByRole("heading", {name: "Privacy Policy", level: 1})).toBeTruthy();
    expect(vi.mocked(service.getLandingPage).mock.calls.map((c) => c[0])).toContain("privacy");
  });

  it("saves an edit as that page's draft, then publishes it", async () => {
    renderEditor();
    await screen.findByRole("heading", {name: "Terms of Use", level: 1});
    fireEvent.click(screen.getByRole("button", {name: /Title, summary and notice/}));
    fireEvent.change(screen.getByLabelText("Last updated"), {target: {value: "1 March 2027"}});

    fireEvent.click(screen.getByRole("button", {name: "Save draft"}));
    await waitFor(() => expect(service.saveLandingDraft).toHaveBeenCalled());
    const [content, baseRevision, page] = vi.mocked(service.saveLandingDraft).mock.calls[0];
    expect(page).toBe("terms");
    expect(baseRevision).toBeNull();
    expect(content.site.updated).toBe("1 March 2027");
    expect(content.blocks).toHaveLength(DOCUMENTS.terms.sections.length);

    fireEvent.click(screen.getByRole("button", {name: "Publish"}));
    fireEvent.change(screen.getByPlaceholderText(/e\.g\./), {target: {value: "Reviewed by counsel"}});
    fireEvent.click(screen.getAllByRole("button", {name: "Publish"}).at(-1)!);
    await waitFor(() => expect(service.publishLandingPage).toHaveBeenCalledWith("Reviewed by counsel", "terms"));
  });

  it("asks before switching pages with unsaved changes, and stays when told to", async () => {
    renderEditor();
    await screen.findByRole("heading", {name: "Terms of Use", level: 1});
    fireEvent.click(screen.getByRole("button", {name: /Title, summary and notice/}));
    fireEvent.change(screen.getByLabelText("Page title"), {target: {value: "Terms of Service"}});

    fireEvent.click(screen.getByRole("tab", {name: "Refund Policy"}));
    expect(await screen.findByText("Leave without saving?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", {name: "Stay here"}));
    expect(screen.getByRole("tab", {name: "Terms of Use"}).getAttribute("aria-selected")).toBe("true");
    expect((screen.getByLabelText("Page title") as HTMLInputElement).value).toBe("Terms of Service");
  });

  it("switches freely when nothing is unsaved", async () => {
    renderEditor();
    await screen.findByRole("heading", {name: "Terms of Use", level: 1});
    fireEvent.click(screen.getByRole("tab", {name: "Refund Policy"}));
    expect(screen.queryByText("Leave without saving?")).toBeNull();
    expect(await screen.findByRole("heading", {name: "Refund Policy", level: 1})).toBeTruthy();
  });
});
