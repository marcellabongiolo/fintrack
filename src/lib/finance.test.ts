import { describe, expect, it } from "vitest";
import type { Transaction } from "../types/finance";
import {
  filterTransactions,
  getSpendingByCategory,
  getMonthlyBudgetProgress,
  getMonthlyCashflow,
  summarizeTransactions,
  transactionsToCsv,
} from "./finance";

const transactions: Transaction[] = [
  {
    id: "salary",
    title: "Monthly salary",
    category: "Salary",
    date: "2026-10-10",
    amount: 3000,
    type: "income",
  },
  {
    id: "rent",
    title: "Apartment rent",
    category: "Housing",
    date: "2026-10-05",
    amount: 1000,
    type: "expense",
  },
  {
    id: "groceries",
    title: "Weekly groceries",
    category: "Food",
    date: "2026-10-08",
    amount: 80,
    type: "expense",
  },
  {
    id: "coffee",
    title: "Coffee with friends",
    category: "Food",
    date: "2026-10-12",
    amount: 20,
    type: "expense",
  },
];

describe("summarizeTransactions", () => {
  it("calculates income, expenses, and balance", () => {
    expect(summarizeTransactions(transactions)).toEqual({
      income: 3000,
      expenses: 1100,
      balance: 1900,
    });
  });

  it("returns zero totals when there are no transactions", () => {
    expect(summarizeTransactions([])).toEqual({
      income: 0,
      expenses: 0,
      balance: 0,
    });
  });
});

describe("getSpendingByCategory", () => {
  it("combines expenses in the same category and sorts by amount", () => {
    expect(getSpendingByCategory(transactions)).toEqual([
      { name: "Housing", value: 1000 },
      { name: "Food", value: 100 },
    ]);
  });

  it("does not include income in the spending breakdown", () => {
    expect(getSpendingByCategory(transactions).some((item) => item.name === "Salary")).toBe(false);
  });
});

describe("filterTransactions", () => {
  it("searches descriptions and categories without case sensitivity", () => {
    expect(filterTransactions(transactions, "FOOD").map((item) => item.id)).toEqual([
      "coffee",
      "groceries",
    ]);
  });

  it("filters by transaction type and sorts newest first", () => {
    expect(filterTransactions(transactions, "", "expense").map((item) => item.id)).toEqual([
      "coffee",
      "groceries",
      "rent",
    ]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterTransactions(transactions, "vacation")).toEqual([]);
  });
});

describe("transactionsToCsv", () => {
  it("exports a header and formatted transaction values", () => {
    expect(transactionsToCsv([transactions[0]])).toBe(
      '"Date","Description","Category","Type","Amount"\r\n' +
        '"2026-10-10","Monthly salary","Salary","income","3000.00"',
    );
  });

  it("escapes commas and quotation marks in user-provided text", () => {
    const unusualTransaction: Transaction = {
      id: "quoted",
      title: 'Dinner, "with friends"',
      category: "Food",
      date: "2026-10-14",
      amount: 45,
      type: "expense",
    };

    expect(transactionsToCsv([unusualTransaction])).toContain(
      '"2026-10-14","Dinner, ""with friends""","Food","expense","45.00"',
    );
  });
});

describe("getMonthlyBudgetProgress", () => {
  it("counts only expenses for the selected month and category", () => {
    const result = getMonthlyBudgetProgress([
      ...transactions,
      { id: "older", title: "Older food", category: "Food", date: "2026-09-12", amount: 50, type: "expense" },
    ], [{ category: "Food", limit: 150 }], "2026-10");
    expect(result).toEqual([{
      category: "Food", limit: 150, spent: 100, remaining: 50,
      percentage: 100 / 150 * 100, exceeded: false,
    }]);
  });

  it("reports over-budget spending and ignores invalid limits", () => {
    const result = getMonthlyBudgetProgress(transactions, [
      { category: "Housing", limit: 900 },
      { category: "Food", limit: 0 },
    ], "2026-10");
    expect(result).toEqual([{
      category: "Housing", limit: 900, spent: 1000, remaining: -100,
      percentage: 1000 / 900 * 100, exceeded: true,
    }]);
  });

  it("returns zero spending when no transactions match the month", () => {
    expect(getMonthlyBudgetProgress(transactions, [{ category: "Food", limit: 200 }], "2026-11")[0])
      .toMatchObject({ spent: 0, remaining: 200, percentage: 0, exceeded: false });
  });
});

describe("getMonthlyCashflow", () => {
  it("returns consecutive months with separate income, expenses and balances", () => {
    const result = getMonthlyCashflow(transactions, "2026-10", 3);
    expect(result).toEqual([
      { month: "2026-08", income: 0, expenses: 0, balance: 0 },
      { month: "2026-09", income: 0, expenses: 0, balance: 0 },
      { month: "2026-10", income: 3000, expenses: 1100, balance: 1900 },
    ]);
  });

  it("handles year boundaries and excludes transactions outside the window", () => {
    const result = getMonthlyCashflow([
      { ...transactions[1], date: "2025-12-05" },
      { ...transactions[2], date: "2026-01-08" },
    ], "2026-01", 2);
    expect(result).toEqual([
      { month: "2025-12", income: 0, expenses: 1000, balance: -1000 },
      { month: "2026-01", income: 0, expenses: 80, balance: -80 },
    ]);
  });

  it("rejects invalid month or count", () => {
    expect(() => getMonthlyCashflow([], "2026-13")).toThrow();
    expect(() => getMonthlyCashflow([], "2026-10", 0)).toThrow();
  });
});
