import type { Category } from "../types";

export const CATEGORIES: Category[] = ["Food", "Transport", "Bills", "Shopping", "Entertainment", "Other"];

// Full class strings so Tailwind can detect them at build time.
export const CATEGORY_DOT: Record<Category, string> = {
  Food: "bg-amber-400",
  Transport: "bg-sky-400",
  Bills: "bg-rose-400",
  Shopping: "bg-fuchsia-400",
  Entertainment: "bg-violet-400",
  Other: "bg-slate-400",
};
