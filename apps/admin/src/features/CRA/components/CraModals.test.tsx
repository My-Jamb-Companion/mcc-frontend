// @vitest-environment jsdom
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

const {deactivateMock, updateMock} = vi.hoisted(() => ({
  deactivateMock: vi.fn(async () => undefined),
  updateMock: vi.fn(async () => ({})),
}));

vi.mock("../services/cra.service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/cra.service")>()),
  deactivateCra: deactivateMock,
  updateCra: updateMock,
}));

import {DeactivateCraModal, EditCraModal} from "./CraModals";

const cra = {cra_id: "c1", full_name: "Zed Agent", email: "zed@example.com", phone: "0800", is_active: true, created_at: "2026-01-01T00:00:00Z"};

const wrap = (ui: React.ReactElement) =>
  render(<QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>{ui}</QueryClientProvider>);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CRA modals", () => {
  it("won't deactivate without a reason, then sends it", async () => {
    const onClose = vi.fn();
    wrap(<DeactivateCraModal cra={cra} onClose={onClose} />);
    const button = screen.getByRole("button", {name: "Deactivate"}) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Reason (required)"), {target: {value: "  Left the team  "}});
    fireEvent.click(button);
    await waitFor(() => expect(deactivateMock).toHaveBeenCalledWith("c1", "Left the team"));
  });

  it("says deactivating can be undone", () => {
    wrap(<DeactivateCraModal cra={cra} onClose={() => {}} />);
    expect(screen.getByText(/activate them again/)).toBeTruthy();
  });

  it("starts from the CRA's current details and saves only name and phone", async () => {
    wrap(<EditCraModal cra={cra} onClose={() => {}} />);
    expect((screen.getByLabelText("Full name") as HTMLInputElement).value).toBe("Zed Agent");
    fireEvent.change(screen.getByLabelText("Phone number"), {target: {value: "0999"}});
    fireEvent.click(screen.getByRole("button", {name: "Save"}));
    await waitFor(() => expect(updateMock).toHaveBeenCalledWith("c1", {full_name: "Zed Agent", phone: "0999"}));
  });
});
