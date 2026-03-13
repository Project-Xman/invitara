import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, createColumnHelper, type SortingState, type ColumnFiltersState } from "@tanstack/react-table";
import { useUpdateRsvpStatus } from "~/lib/queries";

interface RSVP { id: number; name: string; guests: number; status: "attending"|"pending"|"declined"; phone: string|null; email?: string|null; eventsAttending: string[]|null; respondedAt: Date|string|null; }
const col = createColumnHelper<RSVP>();

export function RsvpTable({ data }: { data: RSVP[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const updateStatus = useUpdateRsvpStatus();

  const columns = useMemo(() => [
    col.accessor("name", { header: "Guest Name", cell: (i) => <span className="font-semibold text-sm">{i.getValue()}</span> }),
    col.accessor("guests", { header: "Size", cell: (i) => <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gold-100/80 text-gold-700 text-xs font-bold">{i.getValue()}</span> }),
    col.accessor("status", { header: "Status", cell: (i) => {
      const s = i.getValue();
      const cls: Record<string,string> = { attending: "bg-emerald-50 text-emerald-700 border-emerald-200", pending: "bg-amber-50 text-amber-700 border-amber-200", declined: "bg-red-50 text-red-700 border-red-200" };
      return <select value={s} onChange={(e) => updateStatus.mutate({ id: i.row.original.id, status: e.target.value as any })} className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border appearance-none cursor-pointer ${cls[s]}`}>
        <option value="attending">✓ Attending</option><option value="pending">⏳ Pending</option><option value="declined">✗ Declined</option>
      </select>;
    }, filterFn: "equals" }),
    col.accessor("eventsAttending", { header: "Events", cell: (i) => {
      const ev = i.getValue() || [];
      if (!ev.length) return <span className="text-xs opacity-25">—</span>;
      return <div className="flex flex-wrap gap-1">{ev.map((e: string) => <span key={e} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gold-100/50 text-gold-800 border border-gold-200/20">{e}</span>)}</div>;
    }, enableSorting: false }),
    col.accessor("phone", { header: "Contact", cell: (i) => <span className="text-xs opacity-40 font-mono">{i.getValue()}</span> }),
    col.accessor("respondedAt", { header: "Responded", cell: (i) => {
      const d = i.getValue();
      if (!d) return <span className="text-xs opacity-20">—</span>;
      return <span className="text-xs opacity-40">{new Date(d as string).toLocaleDateString("en-IN",{month:"short",day:"numeric"})}</span>;
    }}),
  ], [updateStatus]);

  const table = useReactTable({ data, columns, state: { sorting, globalFilter, columnFilters }, onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, onColumnFiltersChange: setColumnFilters, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 8 } } });
  const activeFilter = columnFilters.find(f => f.id === "status")?.value as string|undefined;

  return <div>
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <div className="flex-1 min-w-[220px]"><input type="text" placeholder="🔍 Search guests..." value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} className="input-gold !py-2.5 !text-sm" /></div>
      <div className="flex gap-1.5">{(["all","attending","pending","declined"] as const).map(f => <button key={f} onClick={() => setColumnFilters(f === "all" ? [] : [{id:"status",value:f}])} className={`px-4 py-2 rounded-full text-[11px] font-semibold tracking-wide uppercase transition-all border ${(f==="all"&&!activeFilter)||activeFilter===f?"bg-gold-700 text-white border-gold-700 shadow-gold":"bg-white text-cream-800/50 border-gold-200/30 hover:border-gold-400"}`}>{f}</button>)}</div>
    </div>
    <div className="bg-white rounded-2xl border border-gold-200/15 overflow-hidden shadow-card">
      <div className="overflow-x-auto"><table className="w-full"><thead>{table.getHeaderGroups().map(hg => <tr key={hg.id}>{hg.headers.map(h => <th key={h.id} onClick={h.column.getToggleSortingHandler()} className="text-left px-5 py-3.5 text-[10px] font-semibold tracking-[2px] uppercase text-cream-700/50 bg-cream-50/60 border-b border-gold-200/10 cursor-pointer select-none hover:text-gold-700"><div className="flex items-center gap-1">{flexRender(h.column.columnDef.header,h.getContext())}{h.column.getIsSorted()==="asc"&&<span className="text-gold-500">↑</span>}{h.column.getIsSorted()==="desc"&&<span className="text-gold-500">↓</span>}</div></th>)}</tr>)}</thead>
      <tbody>{table.getRowModel().rows.length===0?<tr><td colSpan={columns.length} className="px-5 py-12 text-center text-sm opacity-30">No guests found</td></tr>:table.getRowModel().rows.map(row => <tr key={row.id} className="border-b border-gold-200/5 hover:bg-gold-50/20">{row.getVisibleCells().map(cell => <td key={cell.id} className="px-5 py-3.5 text-sm">{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>)}</tr>)}</tbody></table></div>
      <div className="flex items-center justify-between px-5 py-3 bg-cream-50/40 border-t border-gold-200/10"><span className="text-[11px] opacity-35">{table.getFilteredRowModel().rows.length} guests</span><div className="flex gap-1.5"><button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gold-200/30 disabled:opacity-20 hover:bg-gold-50">← Prev</button><span className="px-3 py-1.5 text-xs opacity-40">{table.getState().pagination.pageIndex+1}/{table.getPageCount()}</span><button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gold-200/30 disabled:opacity-20 hover:bg-gold-50">Next →</button></div></div>
    </div>
  </div>;
}
