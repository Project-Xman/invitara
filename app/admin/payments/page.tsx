"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

import {
  adminPaymentsQueryOptions,
  adminPaymentSummaryQueryOptions,
} from "~/lib/admin-queries";

// ━━━ TYPES ━━━

type Payment = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  type: "subscription" | "credits" | "template";
  amount: number;
  status: "completed" | "pending" | "failed" | "refunded";
  razorpayId: string | null;
  createdAt: string;
};

type PaymentSummary = {
  totalRevenue: number;
  monthRevenue: number;
  failedCount: number;
  averageOrderValue: number;
};

// ━━━ HELPERS ━━━

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-500/10 text-green-600 dark:text-green-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  failed: "bg-red-500/10 text-red-600 dark:text-red-400",
  refunded: "bg-muted text-muted-foreground",
};

const TYPE_LABELS: Record<string, string> = {
  subscription: "Subscription",
  credits: "Credits",
  template: "Template",
};

// ━━━ SUMMARY CARD ━━━

function SummaryCard({
  icon: Icon,
  iconBg,
  label,
  value,
  prefix,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  label: string;
  value: string | number;
  prefix?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-xl ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs uppercase tracking-[2px] text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-foreground">
        {prefix}{value}
      </p>
    </div>
  );
}

// ━━━ SKELETON ━━━

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <tr key={i} className="border-b border-border/30">
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div
                className="h-4 rounded-md bg-accent/50 animate-pulse"
                style={{ width: `${50 + Math.random() * 40}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function SummarySkeletons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-accent/50 animate-pulse" />
            <div className="h-3 w-24 rounded-md bg-accent/50 animate-pulse" />
          </div>
          <div className="h-7 w-28 rounded-md bg-accent/50 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ━━━ MAIN PAGE ━━━

const columnHelper = createColumnHelper<Payment>();

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const pageSize = 25;

  // Debounced search
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  const { data: summaryData, isLoading: summaryLoading } = useQuery(
    adminPaymentSummaryQueryOptions()
  );
  const summary = summaryData as PaymentSummary | undefined;

  const { data, isLoading } = useQuery(
    adminPaymentsQueryOptions({
      page,
      pageSize,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      search: debouncedSearch || undefined,
    })
  );

  const payments = (data?.data ?? []) as Payment[];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "user",
        header: "User",
        cell: (info) => {
          const p = info.row.original;
          return (
            <div>
              <p className="text-sm font-semibold text-foreground">
                {p.userName || "--"}
              </p>
              <p className="text-xs text-muted-foreground">{p.userEmail}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-foreground capitalize">
            {TYPE_LABELS[info.getValue()] ?? info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => (
          <span className="text-sm font-semibold text-foreground">
            ₹{formatCurrency(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status] ?? ""}`}
            >
              {status}
            </span>
          );
        },
      }),
      columnHelper.accessor("razorpayId", {
        header: "Razorpay ID",
        cell: (info) => {
          const id = info.getValue();
          if (!id) return <span className="text-xs text-muted-foreground">--</span>;
          const truncated = id.length > 18 ? id.slice(0, 18) + "..." : id;
          return (
            <span className="text-xs font-mono text-muted-foreground" title={id}>
              {truncated}
            </span>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Date",
        cell: (info) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Payment history and revenue overview
        </p>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <SummarySkeletons />
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={IndianRupee}
            iconBg="bg-primary/10 text-primary"
            label="Total Revenue"
            value={formatCurrency(summary.totalRevenue)}
            prefix="₹"
          />
          <SummaryCard
            icon={TrendingUp}
            iconBg="bg-green-500/10 text-green-500"
            label="This Month"
            value={formatCurrency(summary.monthRevenue)}
            prefix="₹"
          />
          <SummaryCard
            icon={AlertTriangle}
            iconBg="bg-red-500/10 text-red-500"
            label="Failed Payments"
            value={summary.failedCount}
          />
          <SummaryCard
            icon={BarChart3}
            iconBg="bg-blue-500/10 text-blue-500"
            label="Avg Order Value"
            value={formatCurrency(summary.averageOrderValue)}
            prefix="₹"
          />
        </div>
      ) : null}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by email or Razorpay ID..."
            className="input-gold w-full pl-9"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-gold min-w-[140px] appearance-none cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="input-gold min-w-[140px] appearance-none cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="subscription">Subscription</option>
          <option value="credits">Credits</option>
          <option value="template">Template</option>
        </select>

        {/* Count */}
        {!isLoading && (
          <span className="text-xs text-muted-foreground ml-auto">
            {total} payment{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-accent/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-[10px] uppercase tracking-[2px] text-muted-foreground font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No payments found matching your filters.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-border hover:bg-accent/50 text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl border border-border hover:bg-accent/50 text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
