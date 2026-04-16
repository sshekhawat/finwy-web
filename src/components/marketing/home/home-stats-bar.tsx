import { FileText, UserRound, Users } from "lucide-react";

const stats = [
  { icon: FileText, value: "15,204+", label: "Transactions processed" },
  { icon: UserRound, value: "320+", label: "Professional staff (simulated)" },
  { icon: Users, value: "900+", label: "Happy clients" },
];

export function HomeStatsBar() {
  return (
    <section id="stats" className="scroll-mt-20 bg-[#1e4fd6] py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3 sm:gap-4 sm:divide-x sm:divide-white/25">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-4 sm:px-4 sm:first:pl-0 sm:last:pr-0"
            >
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-white/10">
                <Icon className="size-7" aria-hidden />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums md:text-3xl">{s.value}</p>
                <p className="text-sm text-white/85">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
