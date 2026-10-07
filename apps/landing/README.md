# MCC Landing Page

Public marketing site and the entry point to sign-up/login. No authenticated
dashboard lives here: after signing in, the user is handed off to the Student
Platform (`apps/learner`).

## The home page is content-managed

The home page is a list of typed blocks (hero, exams, FAQ, ...) that admins edit in the
admin console (Landing page), then publish. The block types, their editable fields and the
built-in default page live in `packages/landing-content`; the components that draw each
block are in `src/features/home/blocks`.

- `/` fetches the published page from `GET {API}/landing/pages/home`, is static, and
  refreshes in the background at most once a minute. If nothing is published, or the API
  can't be reached, it shows the built-in default, so the page is never blank.
- `/preview` draws whatever the admin console sends it with `postMessage` (unsaved edits),
  for the editor's live preview. Only `NEXT_PUBLIC_ADMIN_URL` is listened to.
- Content links to the other apps as `/go/parent/...`, `/go/teacher/...`, `/go/learner/...`
  (see `src/app/go`), so the content never holds an environment-specific address.
- To add a block type: define it in `packages/landing-content/src/blocks.ts`, add its
  component under `src/features/home/blocks`, and register it in `LandingPage.tsx`.

Environment: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_LEARNER_URL`, `NEXT_PUBLIC_PARENT_URL`,
`NEXT_PUBLIC_TEACHER_URL`, `NEXT_PUBLIC_ADMIN_URL` (see `src/config.ts` for defaults).

```bash
pnpm dev:landing   # from the repo root — runs on http://localhost:3004
```
