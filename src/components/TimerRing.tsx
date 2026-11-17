interface TimerRingProps {
  progress: number; // 0 → 1
  clock: string;
  label: string;
  strokeClass: string;
}

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TimerRing({ progress, clock, label, strokeClass }: TimerRingProps) {
  return (
    <div className="relative mx-auto size-64">
      <svg viewBox="0 0 220 220" className="size-full -rotate-90" aria-hidden>
        <circle cx="110" cy="110" r={RADIUS} fill="none" strokeWidth="10" className="stroke-white/10" />
        <circle cx="110" cy="110" r={RADIUS} fill="none" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          className={`${strokeClass} transition-[stroke-dashoffset] duration-300 ease-linear`} />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <p className="font-display text-6xl font-extrabold tabular-nums" role="timer" aria-live="off">{clock}</p>
        <p className="mt-1 text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
}
