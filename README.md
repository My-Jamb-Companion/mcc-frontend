# 🚀 MCC Frontend (Monorepo)

A scalable **multi-portal LMS frontend** built with **Next.js, TypeScript, and a feature-based architecture**.

---

## 🧠 Overview

This project powers multiple portals:

* 🎓 **Learner** → Student experience
* 🧑‍🏫 **Instructor** → Teaching interface *(coming soon)*
* 🛠️ **Admin** → Management dashboard

Built with a **monorepo architecture** for scalability, maintainability, and shared logic.

---

## 🏗️ Architecture

```
apps/
  learner/
  admin/
  instructor/

packages/
  ui/        → shared UI components
  api/       → API client + interceptors
  store/     → global state (Zustand)
  features/  → domain-based features

tooling/
  tsconfig/
  tailwind/
  eslint/
```

---

## ⚙️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript (strict mode)
* **Styling:** Tailwind CSS (centralized config)
* **State:** Zustand
* **Data Fetching:** React Query
* **API Layer:** Axios (interceptors)
* **Icons:** lucide-react
* **Package Manager:** pnpm (workspace)

---

## 🧩 Key Concepts

### Feature-Based Architecture

Each feature follows:

```
feature/
  components/
  hooks/
  services/
  types/
  index.ts
```

---

### Monorepo Strategy

* Shared logic lives in `packages/`
* Apps are **thin shells**
* Avoid duplication across portals

---

## 🚀 Getting Started

### 1. Install dependencies

```
pnpm install
```

---

### 2. Run apps

```
pnpm dev:learner
pnpm dev:admin
```

---

### 3. Build

```
pnpm build
```

---

## 🌳 Branch Strategy

```
main      → production
staging   → pre-release testing
dev       → active development
feature/* → feature branches
```

---

## 🔁 Development Workflow

1. Create a feature branch:

```
git checkout -b feature/your-feature-name
```

2. Open PR → `dev`

3. Review + merge

4. Promote:

```
dev → staging → main
```

---

## 🔒 Code Rules

* ❌ No direct push to `main`, `staging`, or `dev`
* ✅ PR required for all changes
* ✅ Use strict typing (no `any`)
* ✅ Include loading + error states

---

## 📦 Environment Variables

Each app uses:

```
.env.local
```

Example:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🎨 UI System

All reusable UI components live in:

```
packages/ui
```

---

## 🧠 Principles

* **Scalability first**
* **Separation of concerns**
* **Consistency over preference**
* **Reusable architecture**

---

## 🤝 Contribution

1. Fork repo
2. Create feature branch
3. Open PR
4. Request review

# 🤝 Contributing Guide

## Branching

* Use `feature/*`, `fix/*`, `chore/*`
* Never push directly to `dev`, `staging`, or `main`

---

## Pull Requests

* Must include description
* Must include testing steps
* Must pass build

---

## Code Standards

* Use TypeScript strictly
* No `any`
* Follow feature-based structure

---

## Review Checklist

* Code readability
* No duplication
* Proper error handling
* Reusable components

---

## Commit Convention

```
feat: add new feature
fix: bug fix
refactor: improve structure
chore: maintenance
```

---

## 📌 Future Improvements

* Instructor portal
* Role-based dashboards
* Notifications system
* Analytics dashboard