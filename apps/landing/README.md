# MCC Landing Page

Public marketing/enrolment site — the entry point in the enrolment flow diagram
(`backend/docs/multi-portal-plan.md`, Phase 2). Course + exam-prep catalogue,
self-serve signup/login, and enrollment (free or paid, courses and exam prep).

No authenticated dashboard lives here — after enrolling, the user is handed
off to the Student Platform (`apps/learner`) to actually start learning.

```bash
pnpm dev:landing   # from the repo root — runs on http://localhost:3004
```
