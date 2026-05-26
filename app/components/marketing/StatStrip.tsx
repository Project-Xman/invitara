type Stat = { v: string; l: string };

export function StatStrip({ stats, className = "" }: { stats: Stat[]; className?: string }) {
  return (
    <div className={"flex flex-wrap gap-x-12 gap-y-6 " + className}>
      {stats.map((s) => (
        <div key={s.l} className="flex flex-col gap-1">
          <div className="font-display italic text-3xl font-light text-primary">{s.v}</div>
          <div className="text-[9px] font-medium uppercase tracking-[0.4em] text-muted-foreground">
            {s.l}
          </div>
        </div>
      ))}
    </div>
  );
}
