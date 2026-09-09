// The /vitest subpath registers the matchers *and* augments vitest's
// Assertion type. The bare entry point augments Jest's instead, which is
// why toBeInTheDocument() type-checked as missing.
import "@testing-library/jest-dom/vitest";
