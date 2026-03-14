import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useUpdateRsvpStatus } from "~/lib/queries";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

interface RSVP {
  id: number;
  name: string;
  guests: number;
  status: "attending" | "pending" | "declined";
  phone: string | null;
  email?: string | null;
  eventsAttending: string[] | null;
  respondedAt: Date | string | null;
}
const col = createColumnHelper<RSVP>();

export function RsvpTable({ data }: { data: RSVP[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const updateStatus = useUpdateRsvpStatus();

  const columns = useMemo(
    () => [
      col.accessor("name", {
        header: "Guest Name",
        cell: (i) => <span className="text-sm font-semibold">{i.getValue()}</span>,
      }),
      col.accessor("guests", {
        header: "Size",
        cell: (i) => (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
            {i.getValue()}
          </span>
        ),
      }),
      col.accessor("status", {
        header: "Status",
        cell: (i) => {
          const s = i.getValue();
          const cls: Record<string, string> = {
            attending: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
            pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
            declined: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
          };
          const icons: Record<string, React.ReactNode> = {
            attending: <CheckCircle2 className="mr-1 inline h-3 w-3" />,
            pending: <Clock className="mr-1 inline h-3 w-3" />,
            declined: <XCircle className="mr-1 inline h-3 w-3" />,
          };
          return (
            <select
              value={s}
              onChange={(e) =>
                updateStatus.mutate({ id: i.row.original.id, status: e.target.value as any })
              }
              className={`cursor-pointer appearance-none rounded-full border px-3 py-1.5 text-[11px] font-semibold ${cls[s]}`}
            >
              <option value="attending">Attending</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
          );
        },
        filterFn: "equals",
      }),
      col.accessor("eventsAttending", {
        header: "Events",
        cell: (i) => {
          const ev = i.getValue() || [];
          if (!ev.length) return <span className="text-xs text-muted-foreground/40">--</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {ev.map((e: string) => (
                <span
                  key={e}
                  className="rounded-full border border-border bg-accent px-2 py-0.5 text-[10px] font-medium"
                >
                  {e}
                </span>
              ))}
            </div>
          );
        },
        enableSorting: false,
      }),
      col.accessor("phone", {
        header: "Contact",
        cell: (i) => <span className="font-mono text-xs text-muted-foreground">{i.getValue()}</span>,
      }),
      col.accessor("respondedAt", {
        header: "Responded",
        cell: (i) => {
          const d = i.getValue();
          if (!d) return <span className="text-xs text-muted-foreground/30">--</span>;
          return (
            <span className="text-xs text-muted-foreground">
              {new Date(d as string).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              })}
            </span>
          );
        },
      }),
    ],
    [updateStatus]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });
  const activeFilter = columnFilters.find((f) => f.id === "status")?.value as string | undefined;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
          <input
            type="text"
            placeholder="Search guests..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="input-gold !py-2.5 !pl-9 !text-sm"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "attending", "pending", "declined"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setColumnFilters(f === "all" ? [] : [{ id: "status", value: f }])}
              className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wide transition-all ${(f === "all" && !activeFilter) || activeFilter === f ? "border-primary bg-primary text-primary-foreground shadow-gold" : "border-border bg-card text-muted-foreground hover:border-primary/40"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      onClick={h.column.getToggleSortingHandler()}
                      className="cursor-pointer select-none border-b border-border/50 bg-accent/50 px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground hover:text-primary"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === "asc" && (
                          <ChevronUp className="h-3 w-3 text-primary" />
                        )}
                        {h.column.getIsSorted() === "desc" && (
                          <ChevronDown className="h-3 w-3 text-primary" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-5 py-12 text-center text-sm text-muted-foreground"
                  >
                    No guests found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/30 transition-colors hover:bg-accent/30">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3.5 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border/50 bg-accent/30 px-5 py-3">
          <span className="text-[11px] text-muted-foreground">
            {table.getFilteredRowModel().rows.length} guests
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-20"
            >
              <ChevronLeft className="h-3 w-3" /> Prev
            </button>
            <span className="px-3 py-1.5 text-xs text-muted-foreground">
              {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-20"
            >
              Next <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
