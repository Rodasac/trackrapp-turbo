import { cn } from "@repo/ui/lib/utils";

const SUBSCRIPTIONS = [
  { name: "Netflix", price: "$15.49", due: "Mar 12", color: "bg-red-500" },
  { name: "Spotify", price: "$9.99", due: "Mar 15", color: "bg-green-500" },
  { name: "GitHub", price: "$4.00", due: "Mar 18", color: "bg-gray-700" },
  { name: "Figma", price: "$12.00", due: "Mar 22", color: "bg-purple-500" },
];

const CHART_BARS = [40, 65, 52, 80, 60, 75, 55, 90, 70, 85, 65, 78];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] text-white/50 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      {sub && <p className="text-[10px] text-emerald-400">{sub}</p>}
    </div>
  );
}

export function AppMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl",
        className,
      )}
    >
      {/* Header bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-red-400/70" />
          <div className="size-2.5 rounded-full bg-yellow-400/70" />
          <div className="size-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <span className="text-xs font-medium text-white/40">TrackrApp</span>
        <div className="size-4" />
      </div>

      {/* KPI row */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <KpiCard label="Subscriptions" value="12" sub="2 due soon" />
        <KpiCard label="Monthly Spend" value="$87" sub="↓ $4 vs last mo" />
        <KpiCard label="Annual Total" value="$1,044" />
      </div>

      {/* Mini chart */}
      <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
        <p className="mb-2 text-[10px] uppercase tracking-wide text-white/50">
          Spending trend
        </p>
        <div className="flex items-end gap-1 h-12">
          {CHART_BARS.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-emerald-500/60"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between">
          {MONTHS.map((m) => (
            <span key={m} className="text-[8px] text-white/30">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Subscription list */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <p className="mb-2 text-[10px] uppercase tracking-wide text-white/50">
          Upcoming renewals
        </p>
        <div className="flex flex-col gap-2">
          {SUBSCRIPTIONS.map(({ name, price, due, color }) => (
            <div key={name} className="flex items-center gap-2">
              <div
                className={cn("size-5 rounded-md shrink-0", color)}
                aria-hidden
              />
              <span className="flex-1 text-xs font-medium text-white/80">
                {name}
              </span>
              <span className="text-[10px] text-white/40">{due}</span>
              <span className="text-xs font-semibold text-white">{price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
