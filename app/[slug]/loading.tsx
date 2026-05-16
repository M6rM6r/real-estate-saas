export default function SlugLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-[#070b13] text-white" dir="rtl">
      <div className="relative h-[34vh] min-h-[260px] overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_35%),radial-gradient(circle_at_20%_30%,rgba(148,163,184,0.18),transparent_30%)]" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5 h-16 w-16 rounded-2xl bg-white/10" />
          <div className="mb-3 h-10 w-56 max-w-[70%] rounded-full bg-white/10" />
          <div className="h-4 w-72 max-w-[85%] rounded-full bg-white/5" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_24px_80px_-50px_rgba(59,130,246,0.35)] backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-white/10" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-40 rounded-full bg-white/10" />
              <div className="h-4 w-64 max-w-full rounded-full bg-white/5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl border border-white/5 bg-black/20" />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 h-7 w-36 rounded-full bg-white/10" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_20px_60px_-45px_rgba(15,23,42,0.9)]">
                <div className="h-52 bg-white/10" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 rounded-full bg-white/10" />
                  <div className="h-4 w-1/2 rounded-full bg-white/5" />
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="h-12 rounded-2xl bg-black/20" />
                    <div className="h-12 rounded-2xl bg-black/20" />
                    <div className="h-12 rounded-2xl bg-black/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
