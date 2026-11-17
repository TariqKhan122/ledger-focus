import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "../data/categories";
import { todayISO } from "../utils/format";
import type { Category, ExpenseDraft } from "../types";

export default function ExpenseForm({ onAdd }: { onAdd: (draft: ExpenseDraft) => void }) {
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState<string>(todayISO); // lazy initializer: runs once
  const [note, setNote] = useState<string>("");

  // useRef use case #1 — DOM access. A ref holds the element without re-rendering when it is set.
  const titleRef = useRef<HTMLInputElement>(null);

  // Mount-only effect ([]): runs once after the first paint. The ref is populated by then.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const value = Number(amount);
  const canSubmit = title.trim().length > 0 && Number.isFinite(value) && value > 0; // derived

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd({ title: title.trim(), amount: Math.round(value * 100) / 100, category, date, note: note.trim() });
    setTitle(""); setAmount(""); setNote("");
    titleRef.current?.focus(); // ready for the next entry; no effect needed for this
  };

  return (
    <form onSubmit={handleSubmit} className="glass grid gap-3 p-4 sm:grid-cols-6">
      <input ref={titleRef} value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        placeholder="What did you spend on?" aria-label="Expense title" className="field sm:col-span-3" />
      <input value={amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
        type="number" inputMode="decimal" min="0" step="0.01" placeholder="Amount" aria-label="Amount"
        className="field tabular-nums sm:col-span-1" />
      <select value={category} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as Category)}
        aria-label="Category" className="field sm:col-span-2">
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <input value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
        type="date" aria-label="Date" className="field sm:col-span-2" />
      <input value={note} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
        placeholder="Note (optional)" aria-label="Note" className="field sm:col-span-3" />
      <button type="submit" disabled={!canSubmit}
        className="focus-ring rounded-xl bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-1">
        Add
      </button>
    </form>
  );
}
