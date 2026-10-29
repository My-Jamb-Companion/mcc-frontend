// @vitest-environment jsdom
import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";

vi.mock("@mcc/ui", () => ({Icon: () => null}));
const refetch = vi.fn();
vi.mock("../hooks/useImageLibrary", () => ({
  IMAGE_LIBRARY_KEY: ["admin-image-library"],
  useImageLibrary: () => ({images: [], total: 0, isLoading: false, isError: true, hasMore: false, loadMore: vi.fn(), loadingMore: false, refetch}),
}));

import ImagePickerDialog from "./ImagePickerDialog";

afterEach(cleanup);

describe("ImagePickerDialog when the library can't be read", () => {
  const open = () => render(<ImagePickerDialog open uploading={false} onClose={() => {}} onPick={() => {}} onUpload={() => {}} />);

  it("says so, can try again, and still lets an admin upload", () => {
    open();
    expect(screen.getByText(/library couldn.t be loaded/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", {name: "Try again"}));
    expect(refetch).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getAllByRole("button", {name: "Upload a new one"})[0]);
    expect(screen.getByRole("button", {name: "Choose a file"})).toBeTruthy();
  });
});
