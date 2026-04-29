export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-pulse" dir="rtl">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-slate-200 rounded-md" />

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Content area skeleton */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4">
        <div className="h-5 w-36 bg-slate-200 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-1/2 bg-slate-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
