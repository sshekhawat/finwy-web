/** Horizontal progress row (business / student / housing loan style). */
export function LoanProgress({
  label,
  percent,
}: {
  label: string;
  percent: number;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-[#0c1e45] dark:text-white">{label}</span>
        <span className="tabular-nums text-muted-foreground">{percent}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#1e4fd6] to-[#2563eb] transition-[width] duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
