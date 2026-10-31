# FinTrack

A responsive, browser-based personal finance dashboard built with React, TypeScript, Vite, and Recharts. This portfolio project demonstrates typed frontend development, financial data transformations, automated UI testing, keyboard accessibility and continuous integration.

**Quick links:** [Live demo](https://marcellabongiolo.github.io/fintrack/) · [Source code](https://github.com/marcellabongiolo/fintrack) · [CI checks](https://github.com/marcellabongiolo/fintrack/actions)

## 🚀 Live demo

**[Open FinTrack →](https://marcellabongiolo.github.io/fintrack/)**

Try the app directly in your browser — no installation required.

> **Portfolio project:** FinTrack currently runs in the browser using local storage and sample transactions. It is a learning/demo application, not a financial service. Do not enter sensitive financial information.

## Features

- Financial overview for balance, income, and expenses
- Interactive spending breakdown by category
- Add and delete income/expense transactions
- Search transactions and filter by type
- Monthly budget progress
- CSV export for saved transactions
- Responsive dashboard for desktop and mobile, with working Transactions and Budgets section links on both screen sizes
- Keyboard skip-to-content navigation, accessible transaction dialog, live search counts and budget progress descriptions
- Browser local storage for demo persistence; malformed saved transactions are filtered on load, invalid JSON falls back to sample data, and blocked writes leave the current session usable
- TypeScript for safer, maintainable UI code

## Tech stack

- [React](https://react.dev/) — component-based UI
- [TypeScript](https://www.typescriptlang.org/) — static typing
- [Vite](https://vite.dev/) — development server and build tooling
- [Recharts](https://recharts.org/) — charts
- [Lucide React](https://lucide.dev/) — icons

## Getting started

### Requirements

- Node.js 20.19+ or 22.12+ recommended
- npm
- Git

### Install and run

```bash
git clone https://github.com/marcellabongiolo/fintrack.git
cd fintrack
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

## Automated tests

FinTrack uses [Vitest](https://vitest.dev/) for unit tests of finance utilities (balances, category spending, monthly cashflow, budgets, filtering and CSV escaping) and **React Testing Library with jsdom** for dashboard interaction tests (search, adding transactions, dialog keyboard focus, blocked or corrupted browser storage, skip navigation, sidebar section links, live result counts and budget progress semantics). A CSS regression test checks that mobile navigation remains visible.

Run the test suite once:

```bash
npm test
```

Run tests in watch mode while developing:

```bash
npm run test:watch
```

GitHub Actions runs the unit and React component tests, verifies that `src/App.test.tsx` is discovered, and builds the production app for pushes and pull requests targeting `main`.

## Deployment

The repository includes a GitHub Actions workflow that builds and deploys FinTrack to GitHub Pages when changes are pushed to `main`.

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source if it is not already selected.
3. Open the **Actions** tab and check the **Deploy FinTrack to GitHub Pages** workflow.
4. After a successful deployment, the app is available at [https://marcellabongiolo.github.io/fintrack/](https://marcellabongiolo.github.io/fintrack/).

The first deployment may require enabling GitHub Pages in repository settings.

## Project structure

```text
fintrack/
├── src/
│   ├── data/seed.ts
│   ├── types/finance.ts
│   ├── lib/
│   │   ├── finance.ts
│   │   └── finance.test.ts
│   ├── App.tsx
│   ├── App.test.tsx
│   ├── styles.test.ts
│   ├── main.tsx
│   └── styles.css
├── .env.example
├── .github/workflows/ci.yml
├── .gitignore
├── index.html
├── package.json
├── tsconfig*.json
├── vitest.config.ts
└── vite.config.ts
```

## Roadmap

- [x] Responsive dashboard UI
- [x] Transaction management in the browser
- [x] Spending breakdown and budget progress
- [x] CSV export
- [x] Unit tests for finance calculations and CSV export
- [x] GitHub Actions CI for tests and production build
- [x] GitHub Pages deployment workflow
- [x] Component interaction and targeted accessibility regression tests
- [ ] Backend API and PostgreSQL database
- [ ] Authentication and user-specific data
- [ ] Recurring transactions and budget editing
- [x] Keyboard-accessible transaction dialog and component interaction tests
- [x] Dashboard keyboard skip link, live result counts and semantic budget progress tests
- [x] Working desktop/mobile section navigation and mobile CSS regression test
- [x] Persisted transaction validation and corrupted-storage recovery tests
- [ ] Independent comprehensive accessibility audit (including real browsers and screen readers)

## Architecture and portfolio scope

The React dashboard holds transactions and category budgets in component state. Pure TypeScript helpers in `src/lib/finance.ts` calculate financial summaries, spending, monthly cashflow, budgets, filtering and CSV export. The app reads and writes browser `localStorage` for demo persistence, with an in-memory fallback if storage is blocked. Charts are rendered with Recharts; tests cover both calculation helpers and representative UI interactions.

**Quality checks:** Run `npm test` and `npm run build`. The GitHub Actions CI workflow runs both on pull requests to `main`. Accessibility improvements include a skip link, keyboard-managed transaction dialog, working section links on mobile and desktop, live search counts and labeled budget progress; these targeted tests are **not** a substitute for a full manual screen-reader and cross-browser audit.

**What this version does not include:** backend API, database, login, multi-user synchronization or production financial-data security. These are future enhancements rather than existing features.

## Final verification checklist

Before sharing this portfolio project with a recruiter, check the live demo on a desktop and a phone: open Transactions and Budgets from the navigation, add and remove a sample transaction, search, set a budget, export a CSV and refresh to confirm demo persistence. Check the [GitHub Actions runs](https://github.com/marcellabongiolo/fintrack/actions) for a successful deployment after the latest merge. Automated tests and a successful build do not by themselves prove that the deployed site is current or that every browser and screen reader works correctly.

## Security notes

This version has no backend or authentication. Data is stored in the current browser profile. Do not use it to store real account credentials or sensitive financial information.

## License

MIT
