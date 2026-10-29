// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render as rtlRender, screen, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type {ReactElement} from "react";
import type {ImageLibraryPage, LibraryImage} from "../services/imageLibrary.service";

vi.mock("@mcc/ui", () => ({Icon: () => null}));
const listLibraryImages = vi.fn();
vi.mock("../services/imageLibrary.service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/imageLibrary.service")>()),
  listLibraryImages: (...args: unknown[]) => listLibraryImages(...args),
}));

import ImagePickerDialog from "./ImagePickerDialog";

const image = (n: number, name = `diagram-${n}.png`): LibraryImage => ({url: `https://cdn/lessons/${n}-${name}`, name, size_bytes: 2048, uploaded_at: "2026-10-29T10:00:00+00:00"});
const page = (items: LibraryImage[], offset = 0, total = items.length): ImageLibraryPage => ({items, offset, total, limit: 48});

const render = (ui: ReactElement) => rtlRender(<QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>{ui}</QueryClientProvider>);
const dialog = (props: Partial<React.ComponentProps<typeof ImagePickerDialog>> = {}) => (
  <ImagePickerDialog open uploading={false} onClose={() => {}} onPick={() => {}} onUpload={() => {}} {...props} />
);

beforeEach(() => listLibraryImages.mockReset());
afterEach(cleanup);

describe("ImagePickerDialog", () => {
  it("shows the images uploaded before, and picking one hands back its address", async () => {
    listLibraryImages.mockResolvedValue(page([image(1), image(2)]));
    const onPick = vi.fn();
    render(dialog({onPick}));
    const first = await screen.findByRole("button", {name: /diagram-1\.png/});
    expect(screen.getByRole("tab", {name: /Already uploaded \(2\)/})).toBeTruthy();
    fireEvent.click(first);
    expect(onPick).toHaveBeenCalledWith("https://cdn/lessons/1-diagram-1.png");
  });

  it("loads nothing until it is opened", () => {
    render(dialog({open: false}));
    expect(listLibraryImages).not.toHaveBeenCalled();
  });

  it("searches by file name", async () => {
    listLibraryImages.mockResolvedValue(page([image(1)]));
    render(dialog());
    await screen.findByRole("button", {name: /diagram-1/});
    fireEvent.change(screen.getByLabelText("Search images"), {target: {value: "cell"}});
    await waitFor(() => expect(listLibraryImages).toHaveBeenLastCalledWith(expect.objectContaining({search: "cell", offset: 0})));
  });

  it("offers more when there are more", async () => {
    listLibraryImages.mockResolvedValueOnce(page([image(1), image(2)], 0, 3)).mockResolvedValueOnce(page([image(3)], 2, 3));
    render(dialog());
    await screen.findByRole("button", {name: /diagram-1/});
    fireEvent.click(screen.getByRole("button", {name: "Show more"}));
    await screen.findByRole("button", {name: /diagram-3/});
    expect(listLibraryImages).toHaveBeenLastCalledWith(expect.objectContaining({offset: 2}));
    expect(screen.queryByRole("button", {name: "Show more"})).toBeNull();
  });

  it("says so, and points to uploading, when nothing is there yet", async () => {
    listLibraryImages.mockResolvedValue(page([]));
    render(dialog());
    expect(await screen.findByText("Nothing has been uploaded yet.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", {name: "Upload a new one", hidden: false}));
    expect(screen.getByRole("button", {name: "Choose a file"})).toBeTruthy();
  });

  it("passes a chosen file on to be uploaded", async () => {
    listLibraryImages.mockResolvedValue(page([image(1)]));
    const onUpload = vi.fn();
    render(dialog({onUpload}));
    await screen.findByRole("button", {name: /diagram-1/});
    fireEvent.click(screen.getByRole("tab", {name: "Upload a new one"}));
    const file = new File(["x"], "new.png", {type: "image/png"});
    fireEvent.change(screen.getByLabelText("Choose an image file"), {target: {files: [file]}});
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it("closes with Escape and from the close button", async () => {
    listLibraryImages.mockResolvedValue(page([image(1)]));
    const onClose = vi.fn();
    render(dialog({onClose}));
    await screen.findByRole("button", {name: /diagram-1/});
    fireEvent.keyDown(document, {key: "Escape"});
    fireEvent.click(screen.getByRole("button", {name: "Close"}));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
