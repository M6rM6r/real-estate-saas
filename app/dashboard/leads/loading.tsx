export default function LeadsLoading() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-gray-800 rounded animate-pulse" />
        <div className="h-9 w-28 bg-gray-800 rounded animate-pulse" />
      </div>
      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-3">
        <div className="h-9 w-56 bg-gray-800 rounded animate-pulse" />
        <div className="h-9 w-32 bg-gray-800 rounded animate-pulse" />
        <div className="h-9 w-32 bg-gray-800 rounded animate-pulse" />
      </div>
      {/* Table rows skeleton */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex gap-4 px-4 py-3 border-b border-gray-800">
          {[120, 100, 140, 80].map((w, i) => (
            <div key={i} className="h-4 bg-gray-800 rounded animate-pulse" style={{ width: w }} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-800/50">
            <div className="h-9 w-9 rounded-full bg-gray-800 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-36 bg-gray-800 rounded animate-pulse" />
              <div className="h-3 w-28 bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
            <div className="h-6 w-16 bg-gray-800 rounded-full animate-pulse" />
            <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
