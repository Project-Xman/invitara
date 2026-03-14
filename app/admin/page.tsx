"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  Users,
  Activity,
  IndianRupee,
  FileText,
  Globe,
  UserCheck,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  adminAnalyticsQueryOptions,
  adminSignupChartQueryOptions,
  adminRevenueChartQueryOptions,
  adminPopularTemplatesQueryOptions,
  adminPlanDistributionQueryOptions,
  adminConversionFunnelQueryOptions,
  adminGeoBreakdownQueryOptions,
  adminDeviceBreakdownQueryOptions,
  adminRetentionCohortsQueryOptions,
} from "~/lib/admin-queries";

// ━━━ CHART COLORS ━━━
const CHART_COLORS = [
  "#d4a057", // golden
  "#c2884a", // amber
  "#e6b86e", // light gold
  "#a67c3d", // dark amber
  "#f0c878", // pale gold
  "#8b6914", // bronze
  "#ebd4a7", // cream
  "#b8942e", // antique gold
];

const PIE_COLORS = [
  "#d4a057",
  "#5ba3d9",
  "#6bc77b",
  "#e07c5a",
  "#a37de8",
  "#e8c94a",
  "#e06b9f",
  "#5bd4c4",
];

// ━━━ HELPERS ━━━
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

// ━━━ SKELETON ━━━
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-accent" />
        <div className="flex-1 space-y-2">
          <div className="h-8 w-20 animate-pulse rounded bg-accent" />
          <div className="h-4 w-28 animate-pulse rounded bg-accent" />
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        {title}
      </h3>
      <div className="h-64 w-full animate-pulse rounded-xl bg-accent" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="h-6 w-48 animate-pulse rounded bg-accent mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded bg-accent" />
        ))}
      </div>
    </div>
  );
}

// ━━━ STAT CARDS ━━━
function StatCards() {
  const { data } = useSuspenseQuery(adminAnalyticsQueryOptions());

  const cards = [
    {
      label: "Total Users",
      value: formatNumber(data.totalUsers),
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Active This Month",
      value: formatNumber(data.activeThisMonth),
      icon: Activity,
      color: "text-emerald-600",
      bgColor: "bg-emerald-600/10",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      icon: IndianRupee,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Invitations",
      value: formatNumber(data.totalInvitations),
      icon: FileText,
      color: "text-amber-600",
      bgColor: "bg-amber-600/10",
    },
    {
      label: "Published",
      value: formatNumber(data.publishedInvitations),
      icon: Globe,
      color: "text-emerald-600",
      bgColor: "bg-emerald-600/10",
    },
    {
      label: "Total RSVPs",
      value: formatNumber(data.totalRsvps),
      icon: UserCheck,
      color: "text-violet-600",
      bgColor: "bg-violet-600/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${card.bgColor}`}
              >
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-3xl font-bold text-foreground leading-tight">
                  {card.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground truncate">
                  {card.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ━━━ CUSTOM TOOLTIP ━━━
function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  formatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">
        {label ? formatDate(label) : ""}
      </p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold text-foreground">
          {formatter ? formatter(entry.value) : entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ━━━ SIGNUP CHART ━━━
function SignupChart() {
  const { data } = useSuspenseQuery(adminSignupChartQueryOptions(30));

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Signups Over Time
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#d4a057"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#d4a057" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ━━━ REVENUE CHART ━━━
function RevenueChart() {
  const { data } = useSuspenseQuery(adminRevenueChartQueryOptions(30));

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Revenue Over Time
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4a057" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4a057" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#d4a057"
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ━━━ POPULAR TEMPLATES ━━━
function PopularTemplatesChart() {
  const { data } = useSuspenseQuery(adminPopularTemplatesQueryOptions(10));

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Popular Templates
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              opacity={0.5}
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="templateName"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={120}
              tick={{ fill: "var(--color-muted-foreground)" }}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "var(--color-accent)", opacity: 0.5 }}
            />
            <Bar
              dataKey="count"
              fill="#d4a057"
              radius={[0, 6, 6, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ━━━ PLAN DISTRIBUTION ━━━
function PlanDistributionChart() {
  const { data } = useSuspenseQuery(adminPlanDistributionQueryOptions());

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Plan Distribution
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="plan"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const entry = payload[0];
                return (
                  <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
                    <p className="text-xs text-muted-foreground capitalize">
                      {String(entry.name)}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {Number(entry.value).toLocaleString()} users
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-sm capitalize text-muted-foreground">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ━━━ CONVERSION FUNNEL ━━━
function ConversionFunnel() {
  const { data } = useSuspenseQuery(adminConversionFunnelQueryOptions());

  const steps = [
    { label: "Signup", value: data.signups, icon: Users },
    { label: "Create Invitation", value: data.created, icon: FileText },
    { label: "Publish", value: data.published, icon: Globe },
    { label: "Receive RSVP", value: data.receivedRsvp, icon: UserCheck },
  ];

  const maxValue = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-6">
        Conversion Funnel
      </h3>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const widthPercent = Math.max((step.value / maxValue) * 100, 8);
          const conversionRate =
            index > 0 && steps[index - 1].value > 0
              ? ((step.value / steps[index - 1].value) * 100).toFixed(1)
              : null;

          return (
            <div key={step.label} className="flex items-center gap-4">
              <div className="flex w-36 shrink-0 items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {step.label}
                </span>
              </div>
              <div className="flex-1">
                <div
                  className="flex h-10 items-center rounded-lg px-4 transition-all"
                  style={{
                    width: `${widthPercent}%`,
                    background: `linear-gradient(90deg, #d4a057 0%, #e6b86e 100%)`,
                    opacity: 1 - index * 0.15,
                  }}
                >
                  <span className="text-sm font-bold text-white whitespace-nowrap">
                    {formatNumber(step.value)}
                  </span>
                </div>
              </div>
              <div className="w-16 shrink-0 text-right">
                {conversionRate !== null ? (
                  <span className="text-xs font-medium text-muted-foreground">
                    {conversionRate}%
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ━━━ GEO BREAKDOWN ━━━
function GeoBreakdownChart() {
  const { data } = useSuspenseQuery(adminGeoBreakdownQueryOptions());

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Geographic Breakdown
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="country"
              cx="50%"
              cy="50%"
              outerRadius={100}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell
                  key={`geo-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const entry = payload[0];
                return (
                  <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
                    <p className="text-xs text-muted-foreground">
                      {String(entry.name)}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {Number(entry.value).toLocaleString()} visits
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ━━━ DEVICE BREAKDOWN ━━━
function DeviceBreakdownChart() {
  const { data } = useSuspenseQuery(adminDeviceBreakdownQueryOptions());

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Device Breakdown
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="device"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell
                  key={`device-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const entry = payload[0];
                return (
                  <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
                    <p className="text-xs text-muted-foreground capitalize">
                      {String(entry.name)}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {Number(entry.value).toLocaleString()} sessions
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-sm capitalize text-muted-foreground">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ━━━ RETENTION COHORT TABLE ━━━
function RetentionCohortTable() {
  const { data } = useSuspenseQuery(adminRetentionCohortsQueryOptions(8));

  const maxWeek = 4;
  const weeks = Array.from({ length: maxWeek + 1 }, (_, i) => i);

  function getRetentionColor(rate: number): string {
    if (rate >= 70) return "bg-emerald-500/80 text-white";
    if (rate >= 50) return "bg-emerald-500/50 text-foreground";
    if (rate >= 30) return "bg-amber-500/40 text-foreground";
    if (rate >= 15) return "bg-orange-500/30 text-foreground";
    return "bg-red-500/20 text-foreground";
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Retention Cohorts
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 px-3 text-left text-muted-foreground font-medium">
                Cohort
              </th>
              <th className="py-3 px-3 text-center text-muted-foreground font-medium">
                Size
              </th>
              {weeks.map((w) => (
                <th
                  key={w}
                  className="py-3 px-3 text-center text-muted-foreground font-medium"
                >
                  Week {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((cohort) => (
              <tr
                key={cohort.cohortWeek}
                className="border-b border-border/50 last:border-0"
              >
                <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(cohort.cohortWeek)}
                </td>
                <td className="py-2.5 px-3 text-center font-medium text-foreground">
                  {cohort.cohortSize}
                </td>
                {weeks.map((w) => {
                  const activeUsers = cohort.retention[w];
                  const rate =
                    activeUsers != null && cohort.cohortSize > 0
                      ? Math.round((activeUsers / cohort.cohortSize) * 100)
                      : null;

                  return (
                    <td key={w} className="py-2.5 px-3 text-center">
                      {rate !== null ? (
                        <span
                          className={`inline-flex min-w-[3rem] items-center justify-center rounded-md px-2 py-1 text-xs font-semibold ${getRetentionColor(rate)}`}
                        >
                          {rate}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">--</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={weeks.length + 2}
                  className="py-8 text-center text-muted-foreground"
                >
                  No cohort data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ━━━ LOADING GRID ━━━
function LoadingStatCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ━━━ MAIN PAGE ━━━
export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Row 1 — Summary Cards */}
      <Suspense fallback={<LoadingStatCards />}>
        <StatCards />
      </Suspense>

      {/* Row 2 — Signup & Revenue Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton title="Signups Over Time" />}>
          <SignupChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton title="Revenue Over Time" />}>
          <RevenueChart />
        </Suspense>
      </div>

      {/* Row 3 — Templates & Plan Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton title="Popular Templates" />}>
          <PopularTemplatesChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton title="Plan Distribution" />}>
          <PlanDistributionChart />
        </Suspense>
      </div>

      {/* Row 4 — Conversion Funnel */}
      <Suspense fallback={<ChartSkeleton title="Conversion Funnel" />}>
        <ConversionFunnel />
      </Suspense>

      {/* Row 5 — Geo & Device */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton title="Geographic Breakdown" />}>
          <GeoBreakdownChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton title="Device Breakdown" />}>
          <DeviceBreakdownChart />
        </Suspense>
      </div>

      {/* Row 6 — Retention Cohorts */}
      <Suspense fallback={<TableSkeleton />}>
        <RetentionCohortTable />
      </Suspense>
    </div>
  );
}
