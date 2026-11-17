import { useEffect, useRef, useState } from "react";
import BudgetPanel from "./BudgetPanel";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import { CATEGORIES } from "../data/categories";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { currentMonthKey } from "../utils/format";
import { isExpenseArray, isFiniteNumber, loadJSON, saveJSON } from "../utils/storage";
import type { BudgetStatus, CategoryFilter, Expense, ExpenseDraft } from "../types";

const KEYS = { expenses: "ledger.expenses", budget: "ledger.budget" } as const;

export default function ExpenseTracker({ active }: { active: boolean }) {
  // Lazy initialisers: the function runs ONCE on mount, so localStorage is read once,
  // not on every render. Invalid or missing data falls back safely.
  const [expenses, setExpenses] = useState<Expense[]>(() => loadJSON<Expense[]>(KEYS.expenses, [], isExpenseArray));
  const [budget, setBudget] = useState<number>(() => loadJSON<number>(KEYS.budget, 1000, isFiniteNumber));
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [toast, setToast] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const isDebouncing = search !== debouncedSearch; // derived: true during the 300ms wait

  const searchRef = useRef<HTMLInputElement>(null); // DOM access (Ctrl/Cmd+K focuses it)
  // useRef use case #2 — a mutable value that must survive renders WITHOUT causing one.
  // Writing prevStatusRef.current never re-renders, which is exactly what we want here.
  const prevStatusRef = useRef<BudgetStatus | null>(null);

  // ---- Derived values (no extra state) ----
  const month = currentMonthKey();
  const monthSpent = expenses.filter((e) => e.date.startsWith(month)).reduce((sum, e) => sum + e.amount, 0);
  const percent = budget > 0 ? (monthSpent / budget) * 100 : 0;
  const status: BudgetStatus = budget <= 0 ? "ok" : monthSpent > budget ? "exceeded" : percent >= 80 ? "warning" : "ok";

  const query = debouncedSearch.trim().toLowerCase();
  const visible = expenses
    .filter((e) => category === "All" || e.category === category)
    .filter((e) => query === "" || `${e.title} ${e.note}`.toLowerCase().includes(query))
    .slice() // copy first: .sort() mutates, and state must never be mutated
    .sort((a, b) => b.date.localeCompare(a.date));

  // ---- Effects ----
  // Reactive persistence. One effect per piece of state: each re-runs only when ITS value changes.
  useEffect(() => { saveJSON(KEYS.expenses, expenses); }, [expenses]);
  useEffect(() => { saveJSON(KEYS.budget, budget); }, [budget]);

  // Global shortcut. Cleanup removes the SAME listener function, otherwise listeners pile up.
  // `active` is a dependency: the shortcut is only live while this tab is visible.
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); // stop the browser's own Ctrl+K
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  // Alert only on a status CHANGE. Comparing against the ref avoids a toast on every
  // added expense (and on first load) while the banner above still reflects the current state.
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev !== null && prev !== status && status !== "ok") {
      setToast(status === "exceeded"
        ? `Budget exceeded: you're at ${Math.round(percent)}% of your limit.`
        : `Heads up: ${Math.round(percent)}% of your budget is used.`);
    }
    prevStatusRef.current = status;
  }, [status, percent]);

  // Auto-dismiss the toast; cleanup cancels the timer if a new toast arrives or we unmount.
  useEffect(() => {
    if (toast === null) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  // ---- Handlers (functional, immutable updates) ----
  const addExpense = (draft: ExpenseDraft) =>
    setExpenses((prev) => [{ id: crypto.randomUUID(), ...draft }, ...prev]);
  const deleteExpense = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id));
  const clearFilters = () => { setSearch(""); setCategory("All"); };

  const filters: CategoryFilter[] = ["All", ...CATEGORIES];

  return (
    <div className="space-y-4">
      <BudgetPanel budget={budget} monthSpent={monthSpent} percent={percent} status={status} onBudgetChange={setBudget} />
      <ExpenseForm onAdd={addExpense} />

      <div className="space-y-3">
        <div className="relative">
          <input ref={searchRef} value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search expenses…" aria-label="Search expenses" className="field pr-24" />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-500">
            {isDebouncing ? (
              <span className="flex items-center gap-1.5 text-emerald-300" aria-live="polite">
                <span className="size-2 animate-pulse rounded-full bg-emerald-400" /> Searching
              </span>
            ) : (
              <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-sans">Ctrl K</kbd>
            )}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {filters.map((c) => (
            <button key={c} aria-pressed={category === c}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.blur(); setCategory(c); }}
              className={`focus-ring rounded-full px-3 py-1 text-sm font-semibold transition ${
                category === c ? "bg-white text-slate-900" : "text-slate-400 hover:bg-white/10"
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <ExpenseList expenses={visible} hasAny={expenses.length > 0} onDelete={deleteExpense} onClearFilters={clearFilters} />

      {toast !== null && (
        <div role="status" className="glass fixed bottom-6 left-1/2 z-10 -translate-x-1/2 border-amber-400/40 px-5 py-3 text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
