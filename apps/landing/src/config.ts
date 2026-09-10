// Where the Landing Page hands the user off to once enrolled — there is no
// cross-app SSO between the 5 apps in this monorepo (each has its own
// scoped session, see packages/api/src/session-keys.ts), so the handoff is
// a plain link to the Student Platform's own login, not a token transfer.
export const LEARNER_URL =
  process.env.NEXT_PUBLIC_LEARNER_URL || "http://localhost:3000";
