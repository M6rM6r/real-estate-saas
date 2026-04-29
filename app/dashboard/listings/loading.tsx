export default function ListingsLoading() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-gray-800 rounded animate-pulse" />
        <div className="h-9 w-28 bg-gray-800 rounded animate-pulse" />
      </div>
      {/* Filter bar skeleton */}
      <div className="flex gap-3">
        <div className="h-9 flex-1 max-w-xs bg-gray-800 rounded animate-pulse" />
        <div className="h-9 w-32 bg-gray-800 rounded animate-pulse" />
        <div className="h-9 w-32 bg-gray-800 rounded animate-pulse" />
      </div>
      {/* Cards grid skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="h-48 bg-gray-800 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-800 rounded animate-pulse" />
              <div className="flex gap-2 pt-1">
                <div className="h-8 flex-1 bg-gray-800 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
