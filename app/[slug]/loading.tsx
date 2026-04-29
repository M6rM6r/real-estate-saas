export default function SlugLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse" dir="rtl">
      {/* Hero skeleton */}
      <div className="h-64 bg-slate-200 w-full" />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Profile info skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-200 shrink-0" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-64 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Listings grid skeleton */}
        <div>
          <div className="h-5 w-32 bg-slate-200 rounded mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-slate-100">
                <div className="h-48 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                  <div className="h-4 w-1/3 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
