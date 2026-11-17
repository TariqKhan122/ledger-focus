export type Category = "Food" | "Transport" | "Bills" | "Shopping" | "Entertainment" | "Other";
export type CategoryFilter = Category | "All";
export type BudgetStatus = "ok" | "warning" | "exceeded";
export type Mode = "focus" | "short" | "long";
export type Tab = "expenses" | "timer";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD (local date)
  note: string;
}

export type ExpenseDraft = Omit<Expense, "id">;
export type Durations = Record<Mode, number>; // minutes per mode
