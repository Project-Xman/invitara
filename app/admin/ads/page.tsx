"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  X,
  Loader2,
  Megaphone,
  Eye,
  MousePointerClick,
  BarChart3,
  Power,
} from "lucide-react";

import {
  adminAdsQueryOptions,
  useCreateAd,
  useUpdateAd,
  useDeleteAd,
} from "~/lib/admin-queries";

// ━━━ TYPES ━━━

type Ad = {
  id: string;
  title: string;
  description: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  gradient: string | null;
  icon: string | null;
  slot: string;
  priority: number;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  impressions: number;
  clicks: number;
  createdAt: string;
};

type AdFormData = {
  id?: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  gradient: string;
  icon: string;
  slot: string;
  priority: number;
  active: boolean;
  startDate: string;
  endDate: string;
};

const EMPTY_FORM: AdFormData = {
  title: "",
  description: "",
  ctaText: "",
  ctaLink: "",
  gradient: "",
  icon: "",
  slot: "hero_banner",
  priority: 0,
  active: true,
  startDate: "",
  endDate: "",
};

const SLOTS = [
  "hero_banner",
  "dashboard_top",
  "editor_bottom",
  "template_sidebar",
  "preview_footer",
  "between_events",
] as const;

// ━━━ HELPERS ━━━

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getAdStatus(ad: Ad): { label: string; className: string } {
  const now = new Date();

  if (!ad.active) {
    return {
      label: "Inactive",
      className: "bg-red-500/10 text-red-600 dark:text-red-400",
    };
  }

  if (ad.endDate && new Date(ad.endDate) <= now) {
    return {
      label: "Expired",
      className: "bg-muted text-muted-foreground",
    };
  }

  if (ad.startDate && new Date(ad.startDate) > now) {
    return {
      label: "Scheduled",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    };
  }

  return {
    label: "Active",
    className: "bg-green-500/10 text-green-600 dark:text-green-400",
  };
}

function formatCtr(clicks: number, impressions: number): string {
  if (impressions === 0) return "0.00%";
  return ((clicks / impressions) * 100).toFixed(2) + "%";
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

// ━━━ AD FORM MODAL ━━━

function AdFormModal({
  open,
  onClose,
  editingAd,
}: {
  open: boolean;
  onClose: () => void;
  editingAd: Ad | null;
}) {
  const [form, setForm] = useState<AdFormData>(EMPTY_FORM);
  const createAd = useCreateAd();
  const updateAd = useUpdateAd();
  const isEditing = !!editingAd;

  useEffect(() => {
    if (editingAd) {
      setForm({
        id: editingAd.id,
        title: editingAd.title,
        description: editingAd.description ?? "",
        ctaText: editingAd.ctaText ?? "",
        ctaLink: editingAd.ctaLink ?? "",
        gradient: editingAd.gradient ?? "",
        icon: editingAd.icon ?? "",
        slot: editingAd.slot,
        priority: editingAd.priority,
        active: editingAd.active,
        startDate: editingAd.startDate ? editingAd.startDate.slice(0, 10) : "",
        endDate: editingAd.endDate ? editingAd.endDate.slice(0, 10) : "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingAd, open]);

  const handleSubmit = () => {
    if (!form.title.trim()) return;

    const payload = {
      id: isEditing ? editingAd.id : slugify(form.title),
      title: form.title.trim(),
      description: form.description.trim() || null,
      ctaText: form.ctaText.trim() || null,
      ctaLink: form.ctaLink.trim() || null,
      gradient: form.gradient.trim() || null,
      icon: form.icon.trim() || null,
      slot: form.slot,
      priority: form.priority,
      active: form.active,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };

    const mutation = isEditing ? updateAd : createAd;
    mutation.mutate(payload as any, {
      onSuccess: () => {
        setForm(EMPTY_FORM);
        onClose();
      },
    });
  };

  const isPending = createAd.isPending || updateAd.isPending;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {isEditing ? "Edit Ad Campaign" : "Create Ad Campaign"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-lg hover:bg-accent/50 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Campaign title"
                className="input-gold w-full"
              />
              {!isEditing && form.title && (
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {slugify(form.title)}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Campaign description..."
                className="input-gold w-full resize-none"
              />
            </div>

            {/* CTA Text & Link */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  CTA Text
                </label>
                <input
                  type="text"
                  value={form.ctaText}
                  onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                  placeholder="Learn More"
                  className="input-gold w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  CTA Link
                </label>
                <input
                  type="text"
                  value={form.ctaLink}
                  onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                  placeholder="https://..."
                  className="input-gold w-full"
                />
              </div>
            </div>

            {/* Gradient & Icon */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Gradient
                </label>
                <input
                  type="text"
                  value={form.gradient}
                  onChange={(e) => setForm({ ...form, gradient: e.target.value })}
                  placeholder="linear-gradient(135deg, ...)"
                  className="input-gold w-full"
                />
                {form.gradient && (
                  <div
                    className="mt-2 h-8 rounded-lg border border-border"
                    style={{ background: form.gradient }}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Icon
                </label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="sparkles"
                  className="input-gold w-full"
                />
              </div>
            </div>

            {/* Slot & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Slot
                </label>
                <select
                  value={form.slot}
                  onChange={(e) => setForm({ ...form, slot: e.target.value })}
                  className="input-gold w-full appearance-none cursor-pointer"
                >
                  {SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Priority
                </label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                  className="input-gold w-full"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary/50 w-4 h-4"
              />
              <span className="text-sm font-medium text-foreground">Active</span>
            </label>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="input-gold w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="input-gold w-full"
                />
              </div>
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
              disabled={!form.title.trim() || isPending}
              className="btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Ad"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ━━━ DELETE CONFIRMATION ━━━

function DeleteConfirmDialog({
  ad,
  open,
  onClose,
}: {
  ad: Ad | null;
  open: boolean;
  onClose: () => void;
}) {
  const deleteAd = useDeleteAd();

  const handleConfirm = () => {
    if (!ad) return;
    deleteAd.mutate({ id: ad.id }, { onSuccess: onClose });
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Dialog.Title className="text-lg font-semibold text-foreground mb-2">
            Delete &ldquo;{ad?.title}&rdquo;?
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-6">
            This ad campaign will be permanently deleted. This action cannot be undone.
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
              disabled={deleteAd.isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleteAd.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ━━━ ACTION DROPDOWN ━━━

function AdActionDropdown({
  ad,
  onEdit,
  onDelete,
}: {
  ad: Ad;
  onEdit: (ad: Ad) => void;
  onDelete: (ad: Ad) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const updateAd = useUpdateAd();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
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
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-border bg-card shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            onClick={() => { onEdit(ad); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 text-foreground transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            Edit
          </button>

          <button
            onClick={() => {
              updateAd.mutate({ id: ad.id, active: !ad.active } as any, {
                onSuccess: () => setOpen(false),
              });
            }}
            disabled={updateAd.isPending}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 text-foreground transition-colors disabled:opacity-50"
          >
            <Power className="w-3.5 h-3.5 text-muted-foreground" />
            {ad.active ? "Deactivate" : "Activate"}
          </button>

          <div className="my-1 border-t border-border/50" />

          <button
            onClick={() => { onDelete(ad); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ━━━ SKELETON ━━━

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-border/30">
          {Array.from({ length: 7 }).map((_, j) => (
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

const columnHelper = createColumnHelper<Ad>();

export default function AdminAdsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [deletingAd, setDeletingAd] = useState<Ad | null>(null);

  const { data, isLoading } = useQuery(adminAdsQueryOptions());
  const ads = (data ?? []) as unknown as Ad[];

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => (
          <span className="text-sm font-semibold text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("slot", {
        header: "Slot",
        cell: (info) => (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-foreground">
            {info.getValue().replace(/_/g, " ")}
          </span>
        ),
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: (info) => {
          const status = getAdStatus(info.row.original);
          return (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}
            >
              {status.label}
            </span>
          );
        },
      }),
      columnHelper.accessor("impressions", {
        header: "Impressions",
        cell: (info) => (
          <span className="text-sm text-foreground">{formatNumber(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("clicks", {
        header: "Clicks",
        cell: (info) => (
          <span className="text-sm text-foreground">{formatNumber(info.getValue())}</span>
        ),
      }),
      columnHelper.display({
        id: "ctr",
        header: "CTR",
        cell: (info) => (
          <span className="text-sm font-medium text-primary">
            {formatCtr(info.row.original.clicks, info.row.original.impressions)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <AdActionDropdown
            ad={info.row.original}
            onEdit={(ad) => { setEditingAd(ad); setFormOpen(true); }}
            onDelete={setDeletingAd}
          />
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: ads,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ad Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage ad campaigns, placements, and performance
          </p>
        </div>
        <button
          onClick={() => { setEditingAd(null); setFormOpen(true); }}
          className="btn-gold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </div>

      {/* Summary Cards */}
      {!isLoading && ads.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Megaphone className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs uppercase tracking-[2px] text-muted-foreground">
                Total Ads
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{ads.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-xs uppercase tracking-[2px] text-muted-foreground">
                Total Impressions
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatNumber(ads.reduce((sum, a) => sum + a.impressions, 0))}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-green-500/10">
                <MousePointerClick className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-xs uppercase tracking-[2px] text-muted-foreground">
                Total Clicks
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatNumber(ads.reduce((sum, a) => sum + a.clicks, 0))}
            </p>
          </div>
        </div>
      )}

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
              ) : ads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No ad campaigns yet. Create your first one.
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

      {/* Modals */}
      <AdFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingAd(null); }}
        editingAd={editingAd}
      />
      <DeleteConfirmDialog
        ad={deletingAd}
        open={!!deletingAd}
        onClose={() => setDeletingAd(null)}
      />
    </div>
  );
}
