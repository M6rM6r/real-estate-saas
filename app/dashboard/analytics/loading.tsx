export default function AnalyticsLoading() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header + period toggle skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1.5">
          <div className="h-7 w-28 bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="flex gap-1">
          {[60, 60, 70].map((w, i) => (
            <div key={i} className="h-9 bg-gray-800 rounded animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-800 animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
              <div className="h-7 w-16 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      {/* Chart placeholder skeleton */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="h-4 w-40 bg-gray-800 rounded animate-pulse mb-4" />
        <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
      </div>
      {/* Top listings skeleton */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-5 w-5 bg-gray-800 rounded animate-pulse shrink-0" />
            <div className="flex-1 h-4 bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-12 bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
