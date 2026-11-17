import type { Durations, Mode } from "../types";

export const MODES: Mode[] = ["focus", "short", "long"];
export const DEFAULT_DURATIONS: Durations = { focus: 25, short: 5, long: 15 };

export const MODE_META: Record<Mode, { label: string; stroke: string; active: string }> = {
  focus: { label: "Focus", stroke: "stroke-emerald-400", active: "bg-emerald-500/20 text-emerald-200 border-emerald-400/60" },
  short: { label: "Short break", stroke: "stroke-sky-400", active: "bg-sky-500/20 text-sky-200 border-sky-400/60" },
  long: { label: "Long break", stroke: "stroke-violet-400", active: "bg-violet-500/20 text-violet-200 border-violet-400/60" },
};
