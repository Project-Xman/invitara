"use client";

import { useState, useMemo, useCallback, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  EyeOff,
  Trash2,
  Eye,
  Users,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import {
  adminInvitationsQueryOptions,
  adminTemplatesQueryOptions,
  useAdminUnpublish,
  useAdminDeleteInvitation,
} from "~/lib/admin-queries";

// ━━━ TYPES ━━━

type AdminInvitation = {
  id: string;
  slug: string;
  groomName: string;
  brideName: string;
  templateId: string;
  published: boolean;
  viewCount: number;
  shareCount: number;
  createdAt: Date | string;
  userEmail: string;
  userName: string | null;
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

// ━━━ UNPUBLISH CONFIRMATION ━━━

function UnpublishDialog({
  invitation,
  open,
  onClose,
}: {
  invitation: AdminInvitation | null;
  open: boolean;
  onClose: () => void;
}) {
  const unpublish = useAdminUnpublish();

  const handleConfirm = () => {
    if (!invitation) return;
    unpublish.mutate(
      { invitationId: invitation.id },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Dialog.Title className="text-lg font-semibold text-foreground mb-2">
            Force Unpublish
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-6">
            This will unpublish the invitation for{" "}
            <span className="font-medium text-foreground">
              {invitation?.groomName} & {invitation?.brideName}
            </span>
            . The invitation link will no longer be accessible to guests.
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
              disabled={unpublish.isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {unpublish.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Unpublish
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ━━━ DELETE CONFIRMATION ━━━

function DeleteDialog({
  invitation,
  open,
  onClose,
}: {
  invitation: AdminInvitation | null;
  open: boolean;
  onClose: () => void;
}) {
  const deleteInvitation = useAdminDeleteInvitation();

  const handleConfirm = () => {
    if (!invitation) return;
    deleteInvitation.mutate(
      { invitationId: invitation.id },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Delete Invitation
            </Dialog.Title>
          </div>
          <Dialog.Description className="text-sm text-muted-foreground mb-2">
            This will permanently delete the invitation for{" "}
            <span className="font-medium text-foreground">
              {invitation?.groomName} & {invitation?.brideName}
            </span>
            .
          </Dialog.Description>
          <p className="text-sm text-red-500 mb-6">
            This action cannot be undone. All RSVPs, events, and associated data will be lost.
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleteInvitation.isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleteInvitation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete Permanently
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

// ━━━ MAIN PAGE ━━━

const columnHelper = createColumnHelper<AdminInvitation>();

export default function AdminInvitationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("");
  const [templateFilter, setTemplateFilter] = useState("");

  const [unpublishTarget, setUnpublishTarget] = useState<AdminInvitation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminInvitation | null>(null);

  // Debounced search
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  const { data, isLoading } = useQuery(
    adminInvitationsQueryOptions({
      page,
      pageSize: 20,
      search: debouncedSearch || undefined,
      published: publishedFilter || undefined,
      templateId: templateFilter || undefined,
    })
  );

  // Fetch templates for filter dropdown
  const { data: templatesData } = useQuery(adminTemplatesQueryOptions());

  const invitations = ((data as any)?.data ?? []) as AdminInvitation[];
  const total = (data as any)?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "couple",
        header: "Couple",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div>
              <span className="text-sm font-semibold text-foreground">
                {row.groomName} & {row.brideName}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("templateId", {
        header: "Template",
        cell: (info) => (
          <span className="text-xs text-muted-foreground font-mono">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("published", {
        header: "Published",
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
              Published
            </span>
          ) : (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              Unpublished
            </span>
          ),
      }),
      columnHelper.accessor("viewCount", {
        header: "Views",
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            {Number(info.getValue())}
          </div>
        ),
      }),
      columnHelper.accessor("shareCount", {
        header: "RSVPs",
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            {Number(info.getValue())}
          </div>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => (
          <span
            className="text-xs text-muted-foreground"
            title={new Date(info.getValue()).toLocaleString()}
          >
            {relativeDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("userEmail", {
        header: "Owner",
        cell: (info) => (
          <Link
            href={`/admin/users?search=${encodeURIComponent(info.getValue())}`}
            className="text-xs text-primary hover:underline font-mono"
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-1">
              {row.published && (
                <a
                  href={`/invite/${row.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
                  title="View Live"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {row.published && (
                <button
                  onClick={() => setUnpublishTarget(row)}
                  className="p-1.5 rounded-lg hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 transition-colors"
                  title="Force Unpublish"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setDeleteTarget(row)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: invitations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Invitations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all user invitations across the platform
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
            placeholder="Search couple names or owner email..."
            className="input-gold w-full pl-9"
          />
        </div>

        {/* Published Filter */}
        <select
          value={publishedFilter}
          onChange={(e) => {
            setPublishedFilter(e.target.value);
            setPage(1);
          }}
          className="input-gold min-w-[140px] appearance-none cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Unpublished</option>
        </select>

        {/* Template Filter */}
        <select
          value={templateFilter}
          onChange={(e) => {
            setTemplateFilter(e.target.value);
            setPage(1);
          }}
          className="input-gold min-w-[160px] appearance-none cursor-pointer"
        >
          <option value="">All Templates</option>
          {(templatesData ?? []).map((t: { id: string; name: string }) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Count */}
        {!isLoading && (
          <span className="text-xs text-muted-foreground ml-auto">
            {total} invitation{total !== 1 ? "s" : ""}
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
              ) : invitations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No invitations found matching your filters.
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
      <UnpublishDialog
        invitation={unpublishTarget}
        open={!!unpublishTarget}
        onClose={() => setUnpublishTarget(null)}
      />
      <DeleteDialog
        invitation={deleteTarget}
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
