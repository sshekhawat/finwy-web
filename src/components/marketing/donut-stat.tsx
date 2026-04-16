/** Lightweight SVG donut for “professional staff / delivery” style stats. */
export function DonutStat({
  percent,
  label,
  sub,
}: {
  percent: number;
  label: string;
  sub: string;
}) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative size-[112px]">
        <svg
          className="-rotate-90"
          width="112"
          height="112"
          viewBox="0 0 112 112"
          aria-hidden
        >
          <circle
            cx="56"
            cy="56"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx="56"
            cy="56"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-[#1e4fd6]"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#0c1e45] dark:text-white">
          {percent}%
        </span>
      </div>
      <p className="mt-3 max-w-[9rem] text-sm font-semibold text-[#0c1e45] dark:text-white">
        {label}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
