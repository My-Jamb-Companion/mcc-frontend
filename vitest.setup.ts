// The /vitest subpath registers the matchers *and* augments vitest's
// Assertion type. The bare entry point augments Jest's instead, which is
// why toBeInTheDocument() type-checked as missing.
import "@testing-library/jest-dom/vitest";
import {vi} from "vitest";

// Iconify loads an icon's drawing over the network and finishes with a timer. A test that renders an icon and ends
// first leaves that timer pending, and when it fires the DOM is already gone ("window is not defined", reported as
// an unhandled error against whichever test file was running, which failed CI at random). No test looks at the
// drawing, so icons render as nothing: the same stand-in the individual tests use for @mcc/ui's Icon.
vi.mock("@iconify/react", () => ({
  Icon: () => null,
  addIcon: () => true,
  addCollection: () => true,
}));
