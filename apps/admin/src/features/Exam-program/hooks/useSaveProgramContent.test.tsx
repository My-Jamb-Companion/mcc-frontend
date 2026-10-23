// @vitest-environment jsdom
import {describe, expect, it, vi} from "vitest";
import type {QueryClient} from "@tanstack/react-query";
import {saveProgramContent} from "./useSaveProgramContent";

/** The content save, apart from React: what it sends, what it keeps and what it refreshes. */
function setup(version: number | null, update: ReturnType<typeof vi.fn>) {
  let current = version;
  const form = {
    getValues: vi.fn(() => current),
    setValue: vi.fn((_: string, value: number) => {
      current = value;
    }),
  };
  const queryClient = {invalidateQueries: vi.fn()} as unknown as QueryClient;
  const save = (payload = {topics: []}) => saveProgramContent({form, queryClient, update: update as never}, "p", payload);
  return {save, form, queryClient, invalidate: queryClient.invalidateQueries as unknown as ReturnType<typeof vi.fn>};
}

describe("saveProgramContent", () => {
  it("sends the version the editor holds, then holds the one the server returns", async () => {
    const update = vi.fn().mockResolvedValueOnce({program_id: "p", status: "draft", content_version: 4}).mockResolvedValueOnce({program_id: "p", status: "draft", content_version: 5});
    const {save, form} = setup(3, update);
    await save();
    expect(update).toHaveBeenLastCalledWith("p", {topics: [], base_content_version: 3});
    expect(form.setValue).toHaveBeenCalledWith("contentVersion", 4, {shouldDirty: false});
    await save();
    expect(update).toHaveBeenLastCalledWith("p", {topics: [], base_content_version: 4});
  });

  it("refreshes the program queries after a save, so nothing shows or starts from the old content", async () => {
    const update = vi.fn().mockResolvedValue({program_id: "p", status: "draft", content_version: 1});
    const {save, invalidate} = setup(0, update);
    await save();
    const keys = invalidate.mock.calls.map((c) => (c[0] as {queryKey: unknown[]}).queryKey);
    expect(keys).toEqual(expect.arrayContaining([["exam-program"], ["exam-programs"]]));
  });

  it("keeps its version and refreshes nothing when the server refuses the save", async () => {
    const refusal = {response: {status: 409, data: {error: {code: "CONTENT_CHANGED"}}}};
    const update = vi.fn().mockRejectedValue(refusal);
    const {save, form, invalidate} = setup(2, update);
    await expect(save()).rejects.toBe(refusal);
    expect(form.setValue).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("sends no version when the editor has none", async () => {
    const update = vi.fn().mockResolvedValue({program_id: "p", status: "draft"});
    const {save, form} = setup(null, update);
    await save();
    expect(update).toHaveBeenCalledWith("p", {topics: []});
    expect(form.setValue).not.toHaveBeenCalled();
  });
});
