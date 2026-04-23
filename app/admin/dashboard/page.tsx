'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamically import Recharts components for performance and to fix SSR issues
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })

type AgencyActivity = {
  id: string
  name: string
  slug: string
  status: string
  postCount: number
  createdAt: string
}

type Metrics = {
  totalAgencies: number
  totalPosts: number
  totalMedia: number
  agenciesPerMonth: { month: string; count: number }[]
  topAgencies: { name: string; slug: string; postCount: number }[]
  allAgencies: AgencyActivity[]
}



function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: '#111', border: '1px solid #333', borderRadius: 12, padding: 24 }}>
      <p style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
      <p style={{ color: '#00ff41', fontSize: 36, fontWeight: 'bold', fontFamily: 'monospace' }}>{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(setMetrics)
  }, [])

  if (!metrics) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-green/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow" />
        <p className="text-neon-green font-mono animate-pulse text-glow relative z-10">Initializing system modules...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00ffff]/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="max-w-7xl mx-auto p-8 relative z-10">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-2 h-8 bg-neon-green rounded-full shadow-[0_0_10px_rgba(0,255,65,0.5)]" />
            <h1 className="text-2xl font-mono font-bold text-neon-green text-glow">SYSTEM DASHBOARD</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/tenants" style={{ color: '#aaa', fontFamily: 'monospace', fontSize: 13, padding: '8px 16px', border: '1px solid #333', borderRadius: 8 }}>
              Tenants →
            </Link>
            <Link href="/admin/logs" style={{ color: '#aaa', fontFamily: 'monospace', fontSize: 13, padding: '8px 16px', border: '1px solid #333', borderRadius: 8 }}>
              Audit Log →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
          <StatCard label="Total Agencies" value={metrics.totalAgencies} />
          <StatCard label="Posts (Last 30d)" value={metrics.totalPosts} />
          <StatCard label="Total Media Files" value={metrics.totalMedia} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-panel rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="font-mono text-sm text-gray-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
              New Agencies — Last 12 Months
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.agenciesPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="month" stroke="#777" tick={{ fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#777" tick={{ fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(17, 17, 22, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 255, 65, 0.3)', borderRadius: 8, fontFamily: 'monospace', boxShadow: '0 0 20px rgba(0, 255, 65, 0.1)' }}
                  itemStyle={{ color: '#00ff41' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="count" fill="#00ff41" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-mono text-sm text-gray-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
              Top Agencies by Posts
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left pb-4 font-medium">Agency</th>
                    <th className="text-left pb-4 font-medium">Slug</th>
                    <th className="text-right pb-4 font-medium">Posts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {metrics.topAgencies?.map((agency, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3 text-white flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-green/30 group-hover:bg-neon-green transition-colors" />
                        {agency.name}
                      </td>
                      <td className="py-3 text-gray-500">
                        <a href={`/${agency.slug}`} target="_blank" rel="noopener noreferrer" className="hover:text-neon-green transition-colors">
                          /{agency.slug} ↗
                        </a>
                      </td>
                      <td className="py-3 text-right text-neon-green font-bold">{agency.postCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Agency Activity Monitor */}
        <div className="glass-panel rounded-xl p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h2 className="font-mono text-sm text-gray-400 uppercase tracking-widest">
              Agency Activity Monitor
            </h2>
            <Link
              href="/admin/tenants"
              className="font-mono text-xs text-neon-green hover:text-white transition-colors"
            >
              Manage Tenants →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left pb-4 font-medium">Agency</th>
                  <th className="text-left pb-4 font-medium">Status</th>
                  <th className="text-right pb-4 font-medium">Posts</th>
                  <th className="text-left pb-4 font-medium">Joined</th>
                  <th className="text-right pb-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(metrics.allAgencies ?? metrics.topAgencies?.map(a => ({ ...a, id: a.slug, status: 'active', createdAt: '' }))).map((agency) => (
                  <tr key={agency.id ?? agency.slug} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${agency.status === 'active' ? 'bg-neon-green shadow-[0_0_6px_rgba(0,255,65,0.6)]' : 'bg-red-500'}`} />
                        <span className="text-white">{agency.name}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${agency.status === 'active' ? 'bg-neon-green/10 text-neon-green' : 'bg-red-500/10 text-red-400'}`}>
                        {(agency.status ?? 'active').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-neon-green font-bold">{agency.postCount}</span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {agency.createdAt ? new Date(agency.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/${agency.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded text-xs font-mono border border-white/10 text-gray-400 hover:border-neon-green hover:text-neon-green transition-colors"
                        >
                          View Page ↗
                        </a>
                        <Link
                          href="/admin/tenants"
                          className="px-3 py-1 rounded text-xs font-mono border border-white/10 text-gray-400 hover:border-white/30 hover:text-white transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!metrics.allAgencies || metrics.allAgencies.length === 0) && (
              <p className="text-center text-gray-600 font-mono text-sm py-8">No agencies yet. Create one in Tenants →</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-white/5 mb-8">
          <button
            onClick={() => {
              fetch('/api/admin/login', { method: 'DELETE' }).then(() => {
                window.location.href = '/admin/login'
              })
            }}
            style={{ fontFamily: 'monospace', fontSize: 12, color: '#666', padding: '8px 16px', border: '1px solid #333', borderRadius: 8, background: 'transparent', cursor: 'pointer' }}
          >
            TERMINATE SESSION
          </button>
        </div>
      </div>
    </div>
  )
}