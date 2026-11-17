import { useState } from "react";
import ExpenseTracker from "./components/ExpenseTracker";
import PomodoroTimer from "./components/PomodoroTimer";
import type { Tab } from "./types";

const TABS: { id: Tab; label: string }[] = [
  { id: "expenses", label: "Expense tracker" },
  { id: "timer", label: "Pomodoro timer" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("expenses");

  // Both modules stay mounted so a running timer isn't killed by switching tabs.
  // The `active` prop tells each one whether its keyboard shortcuts should be live.
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10 sm:py-14">
      <header>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Ledger Focus</h1>
        <p className="mt-2 text-slate-400">Track what you spend, then protect the time you work.</p>
      </header>

      <nav role="tablist" className="glass mt-6 grid grid-cols-2 p-1">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.blur(); setTab(t.id); }}
            className={`focus-ring rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === t.id ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"
            }`}>
            {t.label}
          </button>
        ))}
      </nav>

      <section className="mt-6" hidden={tab !== "expenses"}><ExpenseTracker active={tab === "expenses"} /></section>
      <section className="mt-6" hidden={tab !== "timer"}><PomodoroTimer active={tab === "timer"} /></section>
    </main>
  );
}
