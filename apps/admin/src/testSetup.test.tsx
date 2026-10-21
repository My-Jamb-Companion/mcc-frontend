// @vitest-environment jsdom
import {render} from "@testing-library/react";
import {expect, it, vi} from "vitest";
import {ConfirmModal, Icon} from "@mcc/ui";

/**
 * vitest.setup.ts stands icons in for nothing: Iconify finishes loading an icon with a timer, and one still pending when
 * a test file ends fired after the DOM was gone ("window is not defined"), failing CI at random.
 */
it("an icon starts no loading", () => {
  vi.useFakeTimers();
  render(<Icon icon="lucide:some-unloaded-icon" />);
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});

it("nor does an icon inside one of @mcc/ui's own components", () => {
  vi.useFakeTimers();
  render(<ConfirmModal open title="t" onConfirm={() => {}} />);
  const plain = vi.getTimerCount();
  vi.clearAllTimers();
  render(<ConfirmModal open variant="danger" title="t" onConfirm={() => {}} />);
  expect(vi.getTimerCount()).toBe(plain);
  vi.useRealTimers();
});
