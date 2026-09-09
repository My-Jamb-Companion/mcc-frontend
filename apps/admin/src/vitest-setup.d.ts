// Pulls the jest-dom matcher types into this app's TypeScript program.
// The matchers are registered at runtime by the root vitest.setup.ts, but that
// file sits outside this tsconfig's `include`, so without this the assertions
// type-check as missing even though they work.
import "@testing-library/jest-dom/vitest";
