export default function EditorLoading() {
  return (
    <div className="grid min-h-screen grid-cols-1 pt-[68px] lg:grid-cols-[380px_1fr]">
      {/* Sidebar skeleton */}
      <div className="border-r border-gold-200/12 bg-white">
        {/* Tab bar */}
        <div className="flex border-b border-gold-200/12">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-1 py-3.5">
              <div className="mx-auto h-2 w-10 animate-pulse rounded bg-gold-100" />
            </div>
          ))}
        </div>
        {/* Form fields */}
        <div className="space-y-4 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="mb-1.5 h-2 w-20 animate-pulse rounded bg-gold-100" />
              <div className="h-10 animate-pulse rounded-xl bg-gold-50" />
            </div>
          ))}
        </div>
      </div>

      {/* Preview skeleton */}
      <div className="flex items-start justify-center bg-cream-50/30 p-8">
        <div className="w-full max-w-sm animate-pulse rounded-2xl bg-gold-100" style={{ height: 600 }} />
      </div>
    </div>
  );
}
