export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 animate-pulse" dir="rtl">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_80px_-48px_rgba(59,130,246,0.45)] backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded-full bg-slate-700/70" />
            <div className="h-8 w-52 rounded-full bg-slate-600/70" />
          </div>
          <div className="h-11 w-28 rounded-2xl bg-slate-700/70" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-slate-950/50 p-5 space-y-3">
              <div className="h-3 w-20 rounded-full bg-slate-700/80" />
              <div className="h-8 w-16 rounded-xl bg-slate-600/80" />
              <div className="h-3 w-28 rounded-full bg-slate-800/80" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.9)] backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="h-6 w-40 rounded-full bg-slate-700/75" />
          <div className="h-9 w-24 rounded-2xl bg-slate-800/75" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-950/40 p-4">
              <div className="h-11 w-11 rounded-2xl bg-slate-700/70 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded-full bg-slate-700/75" />
                <div className="h-3 w-1/2 rounded-full bg-slate-800/75" />
              </div>
              <div className="h-7 w-20 rounded-full bg-slate-800/80" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
