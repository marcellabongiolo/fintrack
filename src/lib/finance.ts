import type { Transaction, TransactionType } from "../types/finance";

export interface TransactionSummary {
  income: number;
  expenses: number;
  balance: number;
}

export interface SpendingCategory {
  name: string;
  value: number;
}

export function summarizeTransactions(transactions: Transaction[]): TransactionSummary {
  return transactions.reduce<TransactionSummary>(
    (summary, transaction) => {
      if (transaction.type === "income") {
        summary.income += transaction.amount;
      } else {
        summary.expenses += transaction.amount;
      }

      summary.balance = summary.income - summary.expenses;
      return summary;
    },
    { income: 0, expenses: 0, balance: 0 },
  );
}

export function getSpendingByCategory(transactions: Transaction[]): SpendingCategory[] {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") continue;
    totals.set(
      transaction.category,
      (totals.get(transaction.category) ?? 0) + transaction.amount,
    );
  }

  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((first, second) => second.value - first.value);
}

export function filterTransactions(
  transactions: Transaction[],
  query: string,
  type: "all" | TransactionType = "all",
): Transaction[] {
  const normalizedQuery = query.trim().toLowerCase();

  return transactions
    .filter((transaction) => type === "all" || transaction.type === type)
    .filter((transaction) =>
      `${transaction.title} ${transaction.category}`
        .toLowerCase()
        .includes(normalizedQuery),
    )
    .sort((first, second) => second.date.localeCompare(first.date));
}

export function transactionsToCsv(transactions: Transaction[]): string {
  const rows = [
    ["Date", "Description", "Category", "Type", "Amount"],
    ...transactions.map((transaction) => [
      transaction.date,
      transaction.title,
      transaction.category,
      transaction.type,
      transaction.amount.toFixed(2),
    ]),
  ];

  return rows
    .map((row) =>
      row
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\r\n");
}

export interface CategoryBudget {
  category: string;
  limit: number;
}

export interface CategoryBudgetProgress extends CategoryBudget {
  spent: number;
  remaining: number;
  percentage: number;
  exceeded: boolean;
}

/** Monthly expense totals use ISO calendar dates (YYYY-MM-DD). */
export function getMonthlyBudgetProgress(
  transactions: Transaction[],
  budgets: CategoryBudget[],
  month: string,
): CategoryBudgetProgress[] {
  return budgets
    .filter((budget) => Number.isFinite(budget.limit) && budget.limit > 0)
    .map((budget) => {
      const spent = transactions.reduce((total, transaction) => {
        if (
          transaction.type === "expense" &&
          transaction.category === budget.category &&
          transaction.date.slice(0, 7) === month
        ) {
          return total + transaction.amount;
        }
        return total;
      }, 0);

      return {
        ...budget,
        spent,
        remaining: budget.limit - spent,
        percentage: (spent / budget.limit) * 100,
        exceeded: spent > budget.limit,
      };
    });
}
