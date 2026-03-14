"use client";

import { useState, useMemo, useEffect } from "react";
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
  X,
  Loader2,
  Coins,
  Star,
  Power,
} from "lucide-react";

import {
  adminCreditPackagesQueryOptions,
  useCreateCreditPackage,
  useUpdateCreditPackage,
  useToggleCreditPackageActive,
} from "~/lib/admin-queries";

// ━━━ TYPES ━━━

type CreditPackage = {
  id: number;
  name: string;
  credits: number;
  priceInr: number;
  popular: boolean;
  active: boolean;
  createdAt: string;
};

type PackageFormData = {
  name: string;
  credits: number;
  priceInr: number;
  popular: boolean;
};

const EMPTY_FORM: PackageFormData = {
  name: "",
  credits: 0,
  priceInr: 0,
  popular: false,
};

// ━━━ HELPERS ━━━

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

// ━━━ PACKAGE FORM MODAL ━━━

function PackageFormModal({
  open,
  onClose,
  editingPackage,
}: {
  open: boolean;
  onClose: () => void;
  editingPackage: CreditPackage | null;
}) {
  const [form, setForm] = useState<PackageFormData>(EMPTY_FORM);
  const createPackage = useCreateCreditPackage();
  const updatePackage = useUpdateCreditPackage();
  const isEditing = !!editingPackage;

  useEffect(() => {
    if (editingPackage) {
      setForm({
        name: editingPackage.name,
        credits: editingPackage.credits,
        priceInr: editingPackage.priceInr,
        popular: editingPackage.popular,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingPackage, open]);

  const handleSubmit = () => {
    if (!form.name.trim() || form.credits <= 0 || form.priceInr <= 0) return;

    const payload = {
      ...(isEditing ? { id: editingPackage.id } : {}),
      name: form.name.trim(),
      credits: form.credits,
      priceInr: form.priceInr,
      popular: form.popular,
    };

    const mutation = isEditing ? updatePackage : createPackage;
    mutation.mutate(payload as any, {
      onSuccess: () => {
        setForm(EMPTY_FORM);
        onClose();
      },
    });
  };

  const isPending = createPackage.isPending || updatePackage.isPending;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {isEditing ? "Edit Credit Package" : "Add Credit Package"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-lg hover:bg-accent/50 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Starter Pack"
                className="input-gold w-full"
              />
            </div>

            {/* Credits & Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Credits <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.credits || ""}
                  onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                  placeholder="100"
                  min={1}
                  className="input-gold w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Price (INR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.priceInr || ""}
                  onChange={(e) => setForm({ ...form, priceInr: Number(e.target.value) })}
                  placeholder="499"
                  min={1}
                  className="input-gold w-full"
                />
              </div>
            </div>

            {/* Popular Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.popular}
                onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary/50 w-4 h-4"
              />
              <span className="text-sm font-medium text-foreground">Mark as Popular</span>
            </label>
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
              disabled={!form.name.trim() || form.credits <= 0 || form.priceInr <= 0 || isPending}
              className="btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Package"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ━━━ SKELETON ━━━

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
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

// ━━━ MAIN PAGE ━━━

const columnHelper = createColumnHelper<CreditPackage>();

export default function AdminCreditsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null);

  const { data, isLoading } = useQuery(adminCreditPackagesQueryOptions());
  const packages = (data ?? []) as unknown as CreditPackage[];

  const toggleActive = useToggleCreditPackageActive();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <span className="text-sm font-semibold text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("credits", {
        header: "Credits",
        cell: (info) => (
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {info.getValue().toLocaleString()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("priceInr", {
        header: "Price",
        cell: (info) => (
          <span className="text-sm font-semibold text-foreground">
            ₹{formatCurrency(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("popular", {
        header: "Popular",
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              <Star className="w-3 h-3" />
              Popular
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">--</span>
          ),
      }),
      columnHelper.accessor("active", {
        header: "Active",
        cell: (info) => {
          const pkg = info.row.original;
          return (
            <button
              onClick={() => toggleActive.mutate({ id: pkg.id })}
              disabled={toggleActive.isPending}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                info.getValue()
                  ? "bg-green-500"
                  : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  info.getValue() ? "translate-x-[18px]" : "translate-x-[3px]"
                }`}
              />
            </button>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <button
            onClick={() => {
              setEditingPackage(info.row.original);
              setFormOpen(true);
            }}
            className="p-1.5 rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Edit package"
          >
            <Pencil className="w-4 h-4" />
          </button>
        ),
      }),
    ],
    [toggleActive]
  );

  const table = useReactTable({
    data: packages,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Credit Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage credit packages available for purchase
          </p>
        </div>
        <button
          onClick={() => { setEditingPackage(null); setFormOpen(true); }}
          className="btn-gold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
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
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No credit packages yet. Add your first one.
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

      {/* Modal */}
      <PackageFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingPackage(null); }}
        editingPackage={editingPackage}
      />
    </div>
  );
}
