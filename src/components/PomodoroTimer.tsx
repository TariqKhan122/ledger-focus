import { useEffect, useRef, useState } from "react";
import TimerRing from "./TimerRing";
import { DEFAULT_DURATIONS, MODES, MODE_META } from "../data/modes";
import { playChime } from "../utils/audio";
import { formatClock } from "../utils/format";
import { isDurations, loadJSON, saveJSON } from "../utils/storage";
import type { Durations, Mode } from "../types";

const BASE_TITLE = "Ledger Focus";
const STORAGE_KEY = "ledger.durations";

interface Actions { toggle: () => void; reset: () => void }

export default function PomodoroTimer({ active }: { active: boolean }) {
  const [durations, setDurations] = useState<Durations>(() => loadJSON<Durations>(STORAGE_KEY, DEFAULT_DURATIONS, isDurations));
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState<number>(() => durations.focus * 60); // seconds
  const [running, setRunning] = useState<boolean>(false);
  const [sessions, setSessions] = useState<number>(0);
  const [flash, setFlash] = useState<"space" | "r" | null>(null); // visual feedback for shortcuts

  // useRef use case #2 — values that must persist across renders but never trigger one:
  const intervalRef = useRef<number | null>(null);           // the interval ID
  const endTimeRef = useRef<number>(0);                      // wall-clock end time (ms)
  const audioRef = useRef<AudioContext | null>(null);        // the audio engine
  const actionsRef = useRef<Actions>({ toggle: () => {}, reset: () => {} }); // "latest handlers" box

  // ---- Derived values ----
  const total = durations[mode] * 60;
  const progress = total === 0 ? 0 : 1 - remaining / total;
  const clock = formatClock(remaining);
  const meta = MODE_META[mode];

  // ---- Handlers ----
  const toggle = () => {
    if (!running) {
      endTimeRef.current = Date.now() + remaining * 1000; // anchor to the clock, so the timer can't drift
      audioRef.current ??= new AudioContext();            // created inside a user gesture: browsers allow it
      void audioRef.current.resume();
    }
    setRunning((prev) => !prev);
  };

  const reset = () => { setRunning(false); setRemaining(total); };

  const selectMode = (next: Mode) => { setRunning(false); setMode(next); setRemaining(durations[next] * 60); };

  const handleDuration = (m: Mode, e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = Math.min(120, Math.max(1, Math.round(e.target.valueAsNumber) || 1));
    setDurations((prev) => ({ ...prev, [m]: minutes }));
    if (m === mode && !running) setRemaining(minutes * 60);
  };

  // ---- Effects ----
  // Countdown. Depends ONLY on `running`: the tick reads the end time from a ref, so it never
  // holds a stale `remaining` and the interval isn't torn down every second.
  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining(Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000)));
    }, 250); // ticks faster than 1s so display never skips; setting the same value doesn't re-render
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running]);

  // Session completion. Reacts to the countdown hitting 0. Setting running=false first means
  // the next run of this effect exits early, so there is no infinite loop.
  useEffect(() => {
    if (!running || remaining > 0) return;
    setRunning(false);
    if (audioRef.current) playChime(audioRef.current);
    const nextMode: Mode = mode !== "focus" ? "focus" : (sessions + 1) % 4 === 0 ? "long" : "short";
    if (mode === "focus") setSessions((n) => n + 1);
    setMode(nextMode);
    setRemaining(durations[nextMode] * 60);
  }, [running, remaining, mode, sessions, durations]);

  // Tab title mirrors the countdown; cleanup restores it when anything changes or we unmount.
  useEffect(() => {
    if (!running && !active) { document.title = BASE_TITLE; return; }
    document.title = `${clock} · ${meta.label}${running ? "" : " (paused)"}`;
    return () => { document.title = BASE_TITLE; };
  }, [clock, running, active, meta.label]);

  // Keep the "latest handlers" ref fresh. No dependency array on purpose: runs after every render.
  useEffect(() => { actionsRef.current = { toggle, reset }; });

  // Keyboard shortcuts. The listener is added once per `active` change and always calls the
  // newest handlers through the ref, avoiding the stale-closure bug of re-binding old functions.
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      // Don't hijack Space/R while typing or when a focused button should handle Space itself.
      if ((e.target as HTMLElement | null)?.closest("input, textarea, select, button, a, [contenteditable='true']")) return;
      if (e.code === "Space") { e.preventDefault(); actionsRef.current.toggle(); setFlash("space"); }
      else if (e.key.toLowerCase() === "r") { actionsRef.current.reset(); setFlash("r"); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  // Brief highlight on the shortcut hint; cleanup cancels the timer if another key arrives first.
  useEffect(() => {
    if (flash === null) return;
    const id = setTimeout(() => setFlash(null), 200);
    return () => clearTimeout(id);
  }, [flash]);

  // Persist custom durations.
  useEffect(() => { saveJSON(STORAGE_KEY, durations); }, [durations]);

  // Mount-only: release the audio engine on unmount.
  useEffect(() => () => { void audioRef.current?.close(); audioRef.current = null; }, []);

  const kbd = (on: boolean) =>
    `rounded border px-1.5 py-0.5 transition ${on ? "border-emerald-400 bg-emerald-500/30 text-emerald-100" : "border-white/15 text-slate-400"}`;

  return (
    <div className="space-y-4">
      <div className="glass p-6 sm:p-8">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-900/60 p-1" role="group" aria-label="Timer mode">
          {MODES.map((m) => (
            <button key={m} aria-pressed={mode === m}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.blur(); selectMode(m); }}
              className={`focus-ring rounded-lg border px-2 py-2 text-sm font-semibold transition ${
                mode === m ? MODE_META[m].active : "border-transparent text-slate-400 hover:text-white"
              }`}>
              {MODE_META[m].label}
            </button>
          ))}
        </div>

        <div className="mt-6"><TimerRing progress={progress} clock={clock} label={meta.label} strokeClass={meta.stroke} /></div>

        <div className="mt-6 flex justify-center gap-3">
          <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.blur(); toggle(); }}
            className="focus-ring min-w-28 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
            {running ? "Pause" : remaining === total ? "Start" : "Resume"}
          </button>
          <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.blur(); reset(); }}
            className="focus-ring rounded-xl border border-white/15 px-6 py-3 font-semibold text-slate-200 transition hover:bg-white/10">
            Reset
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          <kbd className={kbd(flash === "space")}>Space</kbd> play / pause · <kbd className={kbd(flash === "r")}>R</kbd> reset
        </p>
      </div>

      <div className="glass flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-slate-400">Completed focus sessions</p>
          <p className="font-display text-3xl font-extrabold tabular-nums">{sessions}</p>
        </div>
        <div className="flex gap-1.5" aria-label={`${sessions % 4} of 4 until long break`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`size-3 rounded-full transition ${i < sessions % 4 ? "bg-emerald-400" : "bg-white/15"}`} />
          ))}
        </div>
      </div>

      <div className="glass grid grid-cols-3 gap-3 p-5">
        {MODES.map((m) => (
          <label key={m} className="text-sm text-slate-400">
            {MODE_META[m].label} (min)
            <input type="number" min={1} max={120} value={durations[m]} onChange={(e) => handleDuration(m, e)}
              className="field mt-1 tabular-nums text-slate-100" />
          </label>
        ))}
      </div>
    </div>
  );
}
