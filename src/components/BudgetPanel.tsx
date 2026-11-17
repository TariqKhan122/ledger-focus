import { formatCurrency } from "../utils/format";
import type { BudgetStatus } from "../types";

interface BudgetPanelProps {
  budget: number;
  monthSpent: number;
  percent: number;
  status: BudgetStatus;
  onBudgetChange: (value: number) => void;
}

const BAR: Record<BudgetStatus, string> = { ok: "bg-emerald-400", warning: "bg-amber-400", exceeded: "bg-rose-500" };

export default function BudgetPanel({ budget, monthSpent, percent, status, onBudgetChange }: BudgetPanelProps) {
  const handleBudget = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = e.target.valueAsNumber; // NaN when the field is empty
    onBudgetChange(Number.isFinite(n) ? Math.max(0, n) : 0);
  };

  return (
    <div className="glass p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Spent this month</p>
          <p className="font-display text-4xl font-extrabold tabular-nums">{formatCurrency(monthSpent)}</p>
        </div>
        <label className="text-sm text-slate-400">
          Monthly budget
          <input type="number" min="0" step="50" value={budget} onChange={handleBudget}
            className="field mt-1 w-36 tabular-nums text-slate-100" />
        </label>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Budget used"
        aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full transition-all duration-500 ${BAR[status]}`} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <p className="mt-2 text-sm tabular-nums text-slate-400">
        {budget > 0 ? `${Math.round(percent)}% of ${formatCurrency(budget)}` : "Set a budget to track your limit"}
      </p>

      {/* Conditional rendering with && — the banner exists only when there is something to warn about */}
      {status !== "ok" && (
        <div role="alert" className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
          status === "exceeded" ? "border-rose-400/40 bg-rose-500/10 text-rose-200" : "border-amber-400/40 bg-amber-500/10 text-amber-200"
        }`}>
          {status === "exceeded"
            ? `Budget exceeded by ${formatCurrency(monthSpent - budget)}. Review this month's spending.`
            : `You've used ${Math.round(percent)}% of your budget. ${formatCurrency(budget - monthSpent)} left.`}
        </div>
      )}
    </div>
  );
}
