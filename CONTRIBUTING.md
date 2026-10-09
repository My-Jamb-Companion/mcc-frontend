# Contributing Guide

## Before you start

```bash
pnpm install
pnpm build            # the shared packages are consumed from dist
```

Read the [README](./README.md) for the apps, packages and environment variables.

## Branching

* Branch from `main`: `feat/*`, `fix/*`, `chore/*`, `docs/*`.
* Never push directly to `main`. Open a pull request.
* Keep a pull request to one subject. A reviewer should be able to say what it is for in a sentence.

## Before you open a pull request

Run, from the repository root:

```bash
pnpm lint                       # the root config: it is what CI runs
pnpm --filter <app> typecheck   # for each app you touched
pnpm --filter <app> test
pnpm build                      # if you touched a package in packages/
```

If you changed a shared package (`@mcc/ui`, `@mcc/features`, `@mcc/landing-content`), rebuild it, then run the tests of the apps that use it.

For anything a person can see, **try it in a browser against the real backend**. Type checks do not prove a screen works. Look at the empty, loading and error states, and at phone width (about 375px).

## Pull requests

A pull request description says:

* what changed and why;
* how you tested it, in steps someone else can repeat;
* any new environment variable, migration or backend dependency, and what happens if it is missing;
* anything deliberately left out.

## Code standards

* TypeScript strict. No `any`; no `@ts-ignore` without a comment saying why.
* Follow the feature folder layout in the README. Services call the API, hooks wrap them in React Query, `helper/` holds pure logic with a test.
* Put code two apps need in `packages/`. Do not copy it.
* Every data-driven screen has a loading state, an error state and an empty state. Do not show a made-up number: if a figure has no source yet, leave it out rather than showing a placeholder.
* Show errors with `extractApiError` so the person sees the server's message, not "Request failed with status code 400".
* Text a person reads should be plain and short, and say what to do next.
* Do not put secrets in `NEXT_PUBLIC_*` variables. They are public.
* Do not hard-code a link to another app. Use its environment variable (`NEXT_PUBLIC_LANDING_URL` for the legal pages, for example).

## Tests

* Test pure helpers directly, and test components for behaviour a user can see (text on screen, what a click sends), not implementation details.
* A bug fix comes with a test that fails without the fix.
* Mock at the service boundary (`vi.mock("../services/...")`), not the HTTP library.

## Review checklist

* Does it do what the description says, including when the request fails?
* Is anything duplicated that already exists in `packages/`?
* Are the empty, loading and error states handled?
* Does it work at phone width and in dark mode?
* Are the right queries invalidated after a change?
* Is there a test for the logic that could break?

## Commit convention

```
feat: add new feature
fix: bug fix
refactor: improve structure
docs: documentation only
test: tests only
chore: maintenance
```

Write the subject in the imperative and under about 70 characters, and use the body to say why.
