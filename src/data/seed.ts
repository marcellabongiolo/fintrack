import type { Transaction } from "../types/finance";

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

export const initialTransactions: Transaction[] = [
  { id: "t1", title: "Monthly salary", category: "Salary", date: daysAgo(1), amount: 4850, type: "income" },
  { id: "t2", title: "Apartment rent", category: "Housing", date: daysAgo(2), amount: 1250, type: "expense" },
  { id: "t3", title: "Weekly groceries", category: "Food", date: daysAgo(3), amount: 86.4, type: "expense" },
  { id: "t4", title: "Freelance project", category: "Freelance", date: daysAgo(4), amount: 620, type: "income" },
  { id: "t5", title: "Train pass", category: "Transport", date: daysAgo(5), amount: 42, type: "expense" },
  { id: "t6", title: "Streaming subscription", category: "Entertainment", date: daysAgo(6), amount: 15.99, type: "expense" },
  { id: "t7", title: "Coffee with friends", category: "Food", date: daysAgo(7), amount: 18.5, type: "expense" },
  { id: "t8", title: "Online course", category: "Education", date: daysAgo(8), amount: 49, type: "expense" },
  { id: "t9", title: "Design side gig", category: "Freelance", date: daysAgo(10), amount: 240, type: "income" }
];