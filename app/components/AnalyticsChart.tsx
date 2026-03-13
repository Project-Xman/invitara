import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface DailyView { date: string; views: number }

export function AnalyticsChart({ daily, summary }: {
  daily: DailyView[];
  summary: Record<string, number>;
}) {
  const stats = [
    { label: "Total Views", value: summary.invite_view || 0, icon: "👁️", color: "text-gold-700" },
    { label: "Shares", value: summary.invite_share || 0, icon: "🔗", color: "text-blue-600" },
    { label: "RSVPs", value: summary.rsvp_submit || 0, icon: "💌", color: "text-emerald-600" },
    { label: "Link Clicks", value: summary.link_click || 0, icon: "👆", color: "text-purple-600" },
    { label: "QR Scans", value: summary.qr_scan || 0, icon: "📱", color: "text-orange-600" },
    { label: "Ad Clicks", value: summary.ad_click || 0, icon: "📢", color: "text-pink-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 text-center border border-gold-200/12">
            <span className="text-xl block mb-1">{s.icon}</span>
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] font-semibold tracking-[1px] uppercase opacity-30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {daily.length > 0 && (
        <div className="bg-white rounded-2xl border border-gold-200/12 p-6">
          <h4 className="font-display text-lg font-semibold mb-4">Daily Views (14 days)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A853" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4A853" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A08A5C" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#A08A5C" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: "#FFFDF5", border: "1px solid #FFF0C2", borderRadius: 12, fontSize: 12, fontFamily: "Poppins" }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="views" stroke="#D4A853" strokeWidth={2} fill="url(#viewsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
