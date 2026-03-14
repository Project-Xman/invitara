"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Ban,
  ShieldCheck,
  Megaphone,
  X,
  Loader2,
} from "lucide-react";

import {
  adminUsersQueryOptions,
  useUpdateUserPlan,
  useAdjustUserCredits,
  useToggleUserAds,
  useBanUser,
  useUnbanUser,
} from "~/lib/admin-queries";

// ━━━ TYPES ━━━

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  plan: "free" | "starter" | "premium" | "royal";
  credits: number;
  showAds: boolean;
  banned: boolean;
  emailVerified: boolean;
  createdAt: Date | string;
  invitationCount: number;
};

// ━━━ HELPERS ━━━

function relativeDate(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return d.toLocaleDateString();
}

const PLAN_STYLES: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  starter: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  premium: "bg-primary/10 text-primary",
  royal: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

const PLANS = ["free", "starter", "premium", "royal"] as const;

// ━━━ ACTION DROPDOWN ━━━

function ActionDropdown({
  user,
  onAdjustCredits,
  onBan,
}: {
  user: AdminUser;
  onAdjustCredits: (user: AdminUser) => void;
  onBan: (user: AdminUser) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePlan = useUpdateUserPlan();
  const toggleAds = useToggleUserAds();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setEditingPlan(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(!open); setEditingPlan(false); }}
        className="p-1.5 rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl border border-border bg-card shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Change Plan */}
          {editingPlan ? (
            <div className="px-3 py-2 space-y-1">
              <p className="text-[10px] uppercase tracking-[2px] text-muted-foreground mb-1.5">Select plan</p>
              {PLANS.map((p) => (
                <button
                  key={p}
                  disabled={p === user.plan || updatePlan.isPending}
                  onClick={() => {
                    updatePlan.mutate({ userId: user.id, plan: p }, {
                      onSuccess: () => { setEditingPlan(false); setOpen(false); },
                    });
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm capitalize transition-colors
                    ${p === user.plan
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent/50 text-foreground"
                    } disabled:opacity-50`}
                >
                  {p}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setEditingPlan(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 text-foreground transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
              Change Plan
            </button>
          )}

          {/* Adjust Credits */}
          <button
            onClick={() => { onAdjustCredits(user); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 text-foreground transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
            Adjust Credits
          </button>

          {/* Toggle Ads */}
          <button
            onClick={() => {
              toggleAds.mutate({ userId: user.id }, { onSuccess: () => setOpen(false) });
            }}
            disabled={toggleAds.isPending}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 text-foreground transition-colors disabled:opacity-50"
          >
            <Megaphone className="w-3.5 h-3.5 text-muted-foreground" />
            {user.showAds ? "Disable Ads" : "Enable Ads"}
          </button>

          {/* View Invitations */}
          <Link
            href={`/admin/invitations?userId=${user.id}`}
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 text-foreground transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            View Invitations
          </Link>

          {/* Divider */}
          <div className="my-1 border-t border-border/50" />

          {/* Ban / Unban */}
          <button
            onClick={() => { onBan(user); setOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              user.banned
                ? "hover:bg-green-500/10 text-green-600 dark:text-green-400"
                : "hover:bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {user.banned ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <Ban className="w-3.5 h-3.5" />
            )}
            {user.banned ? "Unban User" : "Ban User"}
          </button>
        </div>
      )}
    </div>
  );
}

// ━━━ ADJUST CREDITS MODAL ━━━

function AdjustCreditsModal({
  user,
  open,
  onClose,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const adjustCredits = useAdjustUserCredits();

  const handleSubmit = () => {
    if (!user || !reason.trim() || amount === 0) return;
    adjustCredits.mutate(
      { userId: user.id, amount, reason: reason.trim() },
      {
        onSuccess: () => {
          setAmount(0);
          setReason("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Adjust Credits for {user?.name || user?.email}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-lg hover:bg-accent/50 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="e.g. 10 or -5"
                className="input-gold w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use negative values to deduct credits. Current balance: {user?.credits ?? 0}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Describe why credits are being adjusted..."
                className="input-gold w-full resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!reason.trim() || amount === 0 || adjustCredits.isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {adjustCredits.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ━━━ BAN CONFIRMATION DIALOG ━━━

function BanConfirmDialog({
  user,
  open,
  onClose,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}) {
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const isBanned = user?.banned ?? false;
  const mutation = isBanned ? unbanUser : banUser;

  const handleConfirm = () => {
    if (!user) return;
    mutation.mutate(
      { userId: user.id },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Dialog.Title className="text-lg font-semibold text-foreground mb-2">
            {isBanned ? "Unban" : "Ban"} {user?.name || user?.email}?
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-6">
            {isBanned
              ? "This user will regain access to the platform and be able to log in again."
              : "This user will be immediately locked out. They will not be able to log in or access any features."}
          </Dialog.Description>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={mutation.isPending}
              className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2 ${
                isBanned
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isBanned ? "Unban" : "Ban"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ━━━ SKELETON ROWS ━━━

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-border/30">
          {Array.from({ length: 8 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded-md bg-accent/50 animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ━━━ MAIN PAGE ━━━

const columnHelper = createColumnHelper<AdminUser>();

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [showBanned, setShowBanned] = useState(false);

  const [creditsUser, setCreditsUser] = useState<AdminUser | null>(null);
  const [banUser, setBanUser] = useState<AdminUser | null>(null);

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

  const { data, isLoading } = useQuery(
    adminUsersQueryOptions({
      page,
      pageSize: 20,
      search: debouncedSearch || undefined,
      plan: planFilter || undefined,
      showBanned,
    })
  );

  const users = (data?.data ?? []) as AdminUser[];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <span className="text-sm font-semibold text-foreground">
            {info.getValue() || "--"}
          </span>
        ),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
          <span className="text-xs text-muted-foreground font-mono">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("plan", {
        header: "Plan",
        cell: (info) => {
          const plan = info.getValue();
          return (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${PLAN_STYLES[plan] ?? PLAN_STYLES.free}`}
            >
              {plan}
            </span>
          );
        },
      }),
      columnHelper.accessor("credits", {
        header: "Credits",
        cell: (info) => (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("invitationCount", {
        header: "Invitations",
        cell: (info) => (
          <span className="text-sm text-foreground">{Number(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Joined",
        cell: (info) => (
          <span className="text-xs text-muted-foreground" title={new Date(info.getValue()).toLocaleString()}>
            {relativeDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("banned", {
        header: "Status",
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
              Banned
            </span>
          ) : (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
              Active
            </span>
          ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <ActionDropdown
            user={info.row.original}
            onAdjustCredits={setCreditsUser}
            onBan={setBanUser}
          />
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage user accounts, plans, and permissions
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-gold w-full pl-9"
          />
        </div>

        {/* Plan Filter */}
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="input-gold min-w-[130px] appearance-none cursor-pointer"
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="premium">Premium</option>
          <option value="royal">Royal</option>
        </select>

        {/* Show Banned Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-muted-foreground hover:text-foreground transition-colors">
          <input
            type="checkbox"
            checked={showBanned}
            onChange={(e) => { setShowBanned(e.target.checked); setPage(1); }}
            className="rounded border-border text-primary focus:ring-primary/50 w-4 h-4"
          />
          Show banned
        </label>

        {/* Count */}
        {!isLoading && (
          <span className="text-xs text-muted-foreground ml-auto">
            {total} user{total !== 1 ? "s" : ""}
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No users found matching your filters.
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

      {/* Modals */}
      <AdjustCreditsModal
        user={creditsUser}
        open={!!creditsUser}
        onClose={() => setCreditsUser(null)}
      />
      <BanConfirmDialog
        user={banUser}
        open={!!banUser}
        onClose={() => setBanUser(null)}
      />
    </div>
  );
}
