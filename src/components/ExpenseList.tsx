import { CATEGORY_DOT } from "../data/categories";
import { formatCurrency, formatDate } from "../utils/format";
import type { Expense } from "../types";

interface ExpenseListProps {
  expenses: Expense[];       // already filtered + sorted by the parent (derived)
  hasAny: boolean;           // are there any expenses at all?
  onDelete: (id: string) => void;
  onClearFilters: () => void;
}

export default function ExpenseList({ expenses, hasAny, onDelete, onClearFilters }: ExpenseListProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Ternary: two different empty states vs the list
  if (expenses.length === 0) {
    return (
      <div className="glass border-dashed px-6 py-12 text-center">
        {hasAny ? (
          <>
            <p className="font-display text-xl font-semibold">No matching expenses</p>
            <p className="mt-1 text-sm text-slate-400">Try a different search or category.</p>
            <button onClick={onClearFilters} className="focus-ring mt-4 rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10">
              Clear filters
            </button>
          </>
        ) : (
          <>
            <p className="font-display text-xl font-semibold">No expenses yet</p>
            <p className="mt-1 text-sm text-slate-400">Add your first expense above to start tracking.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-2">
        {expenses.map((e) => (
          <li key={e.id} className="glass group flex items-center gap-3 px-4 py-3">
            <span className={`size-2.5 shrink-0 rounded-full ${CATEGORY_DOT[e.category]}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{e.title}</p>
              <p className="truncate text-xs text-slate-500">
                {e.category} · {formatDate(e.date)}{e.note && ` · ${e.note}`}
              </p>
            </div>
            <p className="font-semibold tabular-nums">{formatCurrency(e.amount)}</p>
            <button
              onClick={(ev: React.MouseEvent<HTMLButtonElement>) => { ev.currentTarget.blur(); onDelete(e.id); }}
              aria-label={`Delete ${e.title}`}
              className="focus-ring rounded-md px-2 py-1 text-sm text-rose-300 hover:bg-rose-500/15 sm:opacity-0 sm:transition sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-right text-sm tabular-nums text-slate-400">
        {expenses.length} shown · {formatCurrency(total)}
      </p>
    </div>
  );
}
