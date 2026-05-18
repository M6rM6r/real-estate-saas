'use client';

import { useEffect, useState } from 'react';
import type { AdminMetrics } from '@/lib/types';
import { Building2, FileText, Image, ExternalLink, TrendingUp, Sparkles } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function healthColor(score: number): string {
  if (score >= 70) return '#8fd1aa'
  if (score >= 35) return '#f2c57c'
  return '#fb7185'
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const accent = '#8fd1aa';
  const accentSoft = '#b8f0ca';

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-200/40 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <p className="py-20 text-center font-mono text-slate-500">{'> ERROR: Failed to load metrics.'}</p>;
  }

  return (
    <div className="space-y-8 font-mono">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: accentSoft }}>{'> Overview_'}</h1>
        <p className="mt-1 text-sm text-slate-500">Platform-wide metrics and activity</p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border p-4 backdrop-blur-xl" style={{ backgroundColor: 'rgba(8, 17, 13, 0.82)', borderColor: 'rgba(143, 209, 170, 0.16)' }}>
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: accentSoft }}>
            <Sparkles className="h-4 w-4" /> Sales Demo Catalog
          </p>
          <p className="mt-1 text-xs text-slate-500">One-click access to polished demo cards with screenshots and direct links.</p>
        </div>
        <a
          href="/admin/demo-catalog"
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors"
          style={{ borderColor: 'rgba(143, 209, 170, 0.28)', backgroundColor: 'rgba(143, 209, 170, 0.10)', color: accentSoft }}
        >
          Open Catalog <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Agencies', value: data.totalAgencies, icon: Building2 },
          { label: 'Posts (30d)', value: data.totalPosts, icon: FileText },
          { label: 'Media Files', value: data.totalMedia, icon: Image },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border p-5 transition-colors backdrop-blur-xl" style={{ backgroundColor: 'rgba(8, 17, 13, 0.82)', borderColor: 'rgba(143, 209, 170, 0.16)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400">{label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border" style={{ backgroundColor: 'rgba(143, 209, 170, 0.10)', borderColor: 'rgba(143, 209, 170, 0.20)' }}>
                <Icon className="h-4 w-4" style={{ color: accent }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: accentSoft }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border p-5 backdrop-blur-xl" style={{ backgroundColor: 'rgba(8, 17, 13, 0.82)', borderColor: 'rgba(143, 209, 170, 0.16)' }}>
          <h2 className="text-sm font-semibold" style={{ color: accentSoft }}>Billing Health</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">
              <p className="text-xs text-emerald-300/80">Paid</p>
              <p className="text-xl font-bold text-emerald-300">{data.billing.paid}</p>
            </div>
            <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2">
              <p className="text-xs text-amber-300/80">Pending</p>
              <p className="text-xl font-bold text-amber-300">{data.billing.pending}</p>
            </div>
            <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2">
              <p className="text-xs text-rose-300/80">Failed</p>
              <p className="text-xl font-bold text-rose-300">{data.billing.failed}</p>
            </div>
            <div className="rounded-xl border border-slate-400/20 bg-slate-500/10 px-3 py-2">
              <p className="text-xs text-slate-300/80">Unpaid</p>
              <p className="text-xl font-bold text-slate-300">{data.billing.unpaid}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-5 backdrop-blur-xl" style={{ backgroundColor: 'rgba(8, 17, 13, 0.82)', borderColor: 'rgba(143, 209, 170, 0.16)' }}>
          <h2 className="text-sm font-semibold" style={{ color: accentSoft }}>Funnel (last 30 days)</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-between"><span>Signups</span><span>{data.funnel.signupCompleted30d}</span></div>
            <div className="flex items-center justify-between"><span>Signup failures</span><span>{data.funnel.signupFailed30d}</span></div>
            <div className="flex items-center justify-between"><span>First listings</span><span>{data.funnel.firstListingCreated30d}</span></div>
            <div className="flex items-center justify-between"><span>Payment sessions</span><span>{data.funnel.paymentSessionStarted30d}</span></div>
            <div className="flex items-center justify-between"><span>Payments succeeded</span><span>{data.funnel.paymentSucceeded30d}</span></div>
            <div className="flex items-center justify-between"><span>Payments failed</span><span>{data.funnel.paymentFailed30d}</span></div>
            <div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 flex items-center justify-between">
              <span className="text-cyan-200">Signup → Paid Conversion</span>
              <span className="text-cyan-300 font-bold">{data.funnel.signupToPaymentConversionPct30d}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="rounded-2xl border p-6 backdrop-blur-xl" style={{ backgroundColor: 'rgba(8, 17, 13, 0.82)', borderColor: 'rgba(143, 209, 170, 0.16)' }}>
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: accent }} />
          <h2 className="text-sm font-semibold" style={{ color: accentSoft }}>New Agencies per Month</h2>
        </div>
        {data.agenciesPerMonth?.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.agenciesPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(143,209,170,0.10)" />
                <XAxis dataKey="month" stroke="rgba(184,240,202,0.35)" fontSize={11} tickLine={false} />
                <YAxis stroke="rgba(184,240,202,0.35)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#08110d',
                    border: '1px solid rgba(143, 209, 170, 0.22)',
                    borderRadius: '14px',
                    color: accentSoft,
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="count" fill={accent} radius={[8, 8, 0, 0]} opacity={0.78} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-slate-500">{'> no data available'}</p>
        )}
      </div>

      {/* Top Agencies */}
      {data.topAgencies?.length > 0 && (
        <div className="bg-[#0d0d0d] border border-[#00ff41]/20 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#00ff41]/20">
            <h2 className="text-sm font-semibold text-[#00ff41]">Top Agencies by Posts</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#00ff41]/10">
                <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Agency</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Posts</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Link</th>
              </tr>
            </thead>
            <tbody>
              {data.topAgencies.map((a) => (
                <tr key={a.slug} className="border-b border-[#00ff41]/10 hover:bg-[#00ff41]/5">
                  <td className="px-6 py-3 text-[#00ff41] font-medium">{a.name}</td>
                  <td className="px-6 py-3 text-[#00ff41]/60">{a.postCount}</td>
                  <td className="px-6 py-3 text-right">
                    <a
                      href={`/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#00ff41]/60 hover:text-[#00ff41] text-xs"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All Agencies Monitor */}
      {data.allAgencies?.length > 0 && (
        <div className="bg-[#0d0d0d] border border-[#00ff41]/20 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#00ff41]/20">
            <h2 className="text-sm font-semibold text-[#00ff41]">Agency Activity Monitor</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#00ff41]/10">
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Color</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Agency</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Health</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Posts</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Joined</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.allAgencies.map((a) => (
                  <tr key={a.id} className="border-b border-[#00ff41]/10 hover:bg-[#00ff41]/5">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3.5 h-3.5 rounded-full border border-white/10"
                          style={{ backgroundColor: a.primaryColor ?? '#3B82F6' }}
                        />
                        <span className="text-[#00ff41]/45 text-xs">{a.primaryColor ?? '#3B82F6'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                        a.status === 'active'
                          ? 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30'
                          : 'bg-[#ff4141]/10 text-[#ff4141] border border-[#ff4141]/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'active' ? 'bg-[#00ff41] animate-pulse' : 'bg-[#ff4141]'}`} />
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[#00ff41] font-medium">{a.name}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#00ff41]/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${a.healthScore}%`, backgroundColor: healthColor(a.healthScore) }}
                          />
                        </div>
                        <span className="text-xs" style={{ color: healthColor(a.healthScore) }}>{a.healthScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-[#00ff41]/60">{a.postCount}</td>
                    <td className="px-6 py-3 text-[#00ff41]/60">
                      {new Date(a.created_at).toLocaleDateString('en-US')}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <a
                        href={`/${a.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#00ff41]/60 hover:text-[#00ff41] text-xs"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
