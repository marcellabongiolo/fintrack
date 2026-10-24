# FinTrack

A modern, responsive personal finance dashboard built with React, TypeScript, Vite, and Recharts.

> **Portfolio project:** FinTrack currently runs in the browser using local storage and sample transactions. It is a learning/demo application, not a financial service. Do not enter sensitive financial information.

## Features

- Financial overview for balance, income, and expenses
- Interactive spending breakdown by category
- Add and delete income/expense transactions
- Search transactions and filter by type
- Monthly budget progress
- CSV export for saved transactions
- Responsive dashboard for desktop and mobile
- Browser local storage for demo persistence
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

FinTrack uses [Vitest](https://vitest.dev/) to test the core finance utilities, including balance calculations, spending totals, transaction filtering, and CSV escaping.

Run the test suite once:

```bash
npm test
```

Run tests in watch mode while developing:

```bash
npm run test:watch
```

GitHub Actions also runs the unit tests and production build for pushes and pull requests targeting `main`.

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
│   ├── main.tsx
│   └── styles.css
├── .env.example
├── .github/workflows/ci.yml
├── .gitignore
├── index.html
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

## Roadmap

- [x] Responsive dashboard UI
- [x] Transaction management in the browser
- [x] Spending breakdown and budget progress
- [x] CSV export
- [x] Unit tests for finance calculations and CSV export
- [x] GitHub Actions CI for tests and production build
- [ ] Component and accessibility tests
- [ ] Backend API and PostgreSQL database
- [ ] Authentication and user-specific data
- [ ] Recurring transactions and budget editing
- [ ] Accessibility review and CI workflow

## Security notes

This version has no backend or authentication. Data is stored in the current browser profile. Do not use it to store real account credentials or sensitive financial information.

## License

MIT
