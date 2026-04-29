export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-2xl" dir="rtl">
      <div className="h-8 w-24 bg-gray-800 rounded animate-pulse" />
      {/* Public URL card skeleton */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
        <div className="h-5 w-32 bg-gray-800 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-800 rounded animate-pulse" />
        <div className="flex gap-2 pt-1">
          <div className="h-10 flex-1 bg-gray-800 rounded animate-pulse" />
          <div className="h-10 w-10 bg-gray-800 rounded animate-pulse" />
          <div className="h-10 w-10 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
      {/* Agency profile card skeleton */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="h-5 w-36 bg-gray-800 rounded animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-28 bg-gray-800 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
        <div className="h-10 w-32 bg-gray-800 rounded animate-pulse" />
      </div>
    </div>
  );
}
