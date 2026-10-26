import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";

vi.mock("@mcc/ui", () => ({Icon: () => null}));

const getDocument = vi.fn();
vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  GlobalWorkerOptions: {},
  getDocument: (...args: unknown[]) => getDocument(...args),
}));

import PdfLesson from "./PdfLesson";

const page = {
  getViewport: () => ({width: 600, height: 800}),
  render: () => ({promise: Promise.resolve(), cancel: () => {}}),
};
const loaded = (numPages: number) => ({
  promise: Promise.resolve({numPages, getPage: () => Promise.resolve(page)}),
  destroy: vi.fn(),
});

/** Pretend the device is (or isn't) a phone or tablet. */
function device(touch: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: touch,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  getDocument.mockReset();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

describe("a PDF lesson on a desktop", () => {
  it("uses the browser's own PDF reader", () => {
    device(false);
    render(<PdfLesson src="https://cdn/x/notes.pdf" title="Notes" />);
    expect(screen.getByTitle("Notes")).toHaveAttribute("src", "https://cdn/x/notes.pdf");
    expect(getDocument).not.toHaveBeenCalled();
  });
});

describe("a PDF lesson on a phone or tablet", () => {
  beforeEach(() => device(true));

  it("shows every page in a scrolling area, with the page count", async () => {
    getDocument.mockReturnValue(loaded(3));
    const {container} = render(<PdfLesson src="https://cdn/x/notes.pdf" title="Notes" />);
    expect(screen.getByText(/Loading PDF/)).toBeInTheDocument();
    await waitFor(() => expect(container.querySelectorAll("[data-pdf-page]")).toHaveLength(3));
    expect(screen.getByRole("region", {name: /Swipe up and down/})).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(getDocument).toHaveBeenCalledWith({url: "https://cdn/x/notes.pdf"});
    expect(screen.queryByTitle("Notes")).not.toBeInTheDocument();
  });

  it("says so, and links to the file, when it cannot be read", async () => {
    getDocument.mockReturnValue({promise: Promise.reject(new Error("CORS")), destroy: vi.fn()});
    render(<PdfLesson src="https://cdn/x/notes.pdf" title="Notes" />);
    const link = await screen.findByRole("link", {name: "Open the PDF"});
    expect(link).toHaveAttribute("href", "https://cdn/x/notes.pdf");
  });

  it("goes full screen and back, keeping every page", async () => {
    getDocument.mockReturnValue(loaded(2));
    const {container} = render(<PdfLesson src="https://cdn/x/notes.pdf" title="Notes" />);
    await waitFor(() => expect(container.querySelectorAll("[data-pdf-page]")).toHaveLength(2));

    fireEvent.click(screen.getByRole("button", {name: "Full screen"}));
    expect(document.body.querySelector(".fixed.inset-0")).not.toBeNull();
    expect(document.body.querySelectorAll("[data-pdf-page]")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", {name: "Exit full screen"}));
    expect(document.body.querySelector(".fixed.inset-0")).toBeNull();
    expect(document.body.querySelectorAll("[data-pdf-page]")).toHaveLength(2);
  });
});
