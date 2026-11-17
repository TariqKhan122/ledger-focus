import { CATEGORIES } from "../data/categories";
import type { Category, Durations, Expense } from "../types";

// localStorage can throw (private mode, quota) or hold stale/corrupt JSON,
// so every read is wrapped and validated before it becomes React state.
export function loadJSON<T>(key: string, fallback: T, isValid: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full: the app keeps working in memory */
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

export const isFiniteNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;

const isExpense = (v: unknown): v is Expense =>
  isRecord(v) &&
  typeof v.id === "string" && typeof v.title === "string" && typeof v.amount === "number" &&
  typeof v.date === "string" && typeof v.note === "string" &&
  CATEGORIES.includes(v.category as Category);

export const isExpenseArray = (v: unknown): v is Expense[] => Array.isArray(v) && v.every(isExpense);

export const isDurations = (v: unknown): v is Durations =>
  isRecord(v) && [v.focus, v.short, v.long].every((n) => typeof n === "number" && n >= 1 && n <= 120);
