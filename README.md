# MCC Frontend

The web apps for **My Course Companion (MCC)**: a learning platform with exam prep, courses, live classes, an AI study companion and rewards. This is a **pnpm + Turborepo monorepo**. Each audience has its own Next.js app, and the shared code lives in `packages/`.

The API is a separate repository (the Flask backend). Its interactive reference is `docs/API.md` and `docs/openapi.json` over there.

---

## The apps

| App | Who it is for | Port | Command |
| --- | --- | --- | --- |
| `apps/learner` | Students: dashboard, courses, exam prep, Brainy, wallet, rewards, certificates | 3000 | `pnpm dev:learner` |
| `apps/admin` | Staff: users, teachers, programs, pricing, finance, gamification rules, landing page editor, analytics | 3001 | `pnpm dev:admin` |
| `apps/teacher` | Teachers: onboarding and verification, sessions, availability, messages, earnings, notifications | 3002 | `pnpm dev:teacher` |
| `apps/parent` | Parents: their children's progress, paying for them, receipts, adding a child, notifications | 3003 | `pnpm dev:parent` |
| `apps/landing` | The public site: home page (edited from the admin console), About, Contact, Terms, Privacy, Refund policy | 3004 | `pnpm dev:landing` |
| `apps/cra` | Course coordinators: onboarding queue, messaging students, availability, notifications | 3005 | `pnpm dev:cra` |

Each app keeps its own sign-in session (the cookie name includes `NEXT_PUBLIC_APP_ID`), so being signed in to one does not sign you in to another.

## The packages

| Package | What is in it |
| --- | --- |
| `@mcc/ui` | Shared components (`Modal`, `Button`, `LegalLink`, toasts, confetti) and theme. Consumed from `dist`, so **rebuild it after editing** (`pnpm --filter @mcc/ui build`). |
| `@mcc/api` | The Axios client, token refresh and error helpers (`extractApiError`). |
| `@mcc/store` | Zustand stores (auth, theme). |
| `@mcc/types` | Types shared by the apps. |
| `@mcc/features` | Code that more than one app needs: login, sign-up and password reset forms, WhatsApp code login, the notifications inbox, the student-coordinator message thread, teacher lists. Consumed from `dist`. |
| `@mcc/landing-content` | The landing page's block definitions, default content and validation, shared by the landing app and the admin editor. Consumed from `dist`. |

`tooling/` holds the shared TypeScript, Tailwind and ESLint configuration.

> Packages that are consumed from `dist` need a rebuild before an app sees your change: `pnpm build` at the root does everything, or `pnpm --filter <package> build` for one.

---

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · TanStack React Query v5 · Zustand · Axios · react-hook-form · Vitest and Testing Library.

## Getting started

Requires Node 20.19 or newer and pnpm 10.

```bash
pnpm install
pnpm build          # builds the shared packages (and every app)
pnpm dev:learner    # or dev:admin, dev:teacher, dev:parent, dev:landing, dev:cra
```

You also need the backend running (default `http://localhost:8080`) for anything that signs in.

### Environment variables

Each app reads its own `.env.local`. All of these are `NEXT_PUBLIC_*`, so they are visible in the browser. Never put a secret in one.

| Variable | Used by | What it is |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | every app | Base address of the backend API. |
| `NEXT_PUBLIC_LANDING_URL` | every app | Public address of the landing site. The apps link to its Terms, Privacy and Refund pages with it, and the landing site uses it for canonical links, the sitemap and sharing cards. Defaults to `http://localhost:3004`. |
| `NEXT_PUBLIC_LEARNER_URL`, `NEXT_PUBLIC_PARENT_URL`, `NEXT_PUBLIC_TEACHER_URL` | landing | Where the landing site sends people to log in or sign up. |
| `NEXT_PUBLIC_ADMIN_URL` | landing | The one origin allowed to send live-preview content to the landing `/preview` page. |
| `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_SUPPORT_WHATSAPP` | landing | Shown on the Contact page. Leave unset to hide that channel. |

Example `apps/learner/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_LANDING_URL=http://localhost:3004
```

---

## Commands

```bash
pnpm lint                      # ESLint for the whole repo (this is what CI runs)
pnpm test                      # every package's and app's tests
pnpm --filter admin test       # one app's tests
pnpm --filter admin typecheck  # one app's type check
pnpm build                     # build everything
pnpm ci:check                  # install, build, typecheck and lint: what CI does
```

Run the **root** `pnpm lint`, not just an app's own: CI uses the root configuration and catches things the per-app one does not.

## How the code is organised

Each app is a thin shell of routes (`src/app`) around feature folders (`src/features/<name>`):

```
src/features/<name>/
  components/     UI for this feature
  hooks/          React Query hooks (queries and mutations)
  services/       functions that call the API (no React)
  helper/         pure functions: mapping, formatting, validation (unit-tested)
```

Conventions:

* Services return the unwrapped `data` from the API's `{ success, data }` envelope.
* Pure logic goes in `helper/` with a test next to it. Components stay thin.
* Anything two apps need goes into `packages/`, not copied across.
* Every screen needs a loading state, an error state and an empty state.
* After a change that affects other screens (a payment, a lesson finished, a reward earned), invalidate the React Query keys that show it.

## Branches and releases

Branch from `main` and open a pull request back into `main`. CI (typecheck, tests, build, lint) must pass. The backend uses a different flow, with work on `dev` and promotion to `main` after manual testing; see its own README.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for pull request and review expectations.
