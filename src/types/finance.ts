export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: TransactionType;
}