export default function DashboardLoading() {
  return (
    <div className="min-h-screen pt-[68px]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gold-100" />
          <div className="h-9 w-36 animate-pulse rounded-xl bg-gold-100" />
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gold-50" />
          ))}
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-2xl bg-gold-50" />
            <div className="h-48 animate-pulse rounded-2xl bg-gold-50" />
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-gold-50" />
        </div>
      </div>
    </div>
  );
}
