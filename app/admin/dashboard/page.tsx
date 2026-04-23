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

type Metrics = {
  totalAgencies: number
  totalPosts: number
  totalMedia: number
  agenciesPerMonth: { month: string; count: number }[]
  topAgencies: { name: string; slug: string; postCount: number }[]
}

// Icons
const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
    <path d="M4.5 10.75a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zM4.5 14.75a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" />
  </svg>
)

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
    <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
  </svg>
)

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .138.112.25.25.25h16.5A.25.25 0 0020 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
)

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H3a.75.75 0 010-1.5h8.69l-1.72-1.72a.75.75 0 011.06-1.06l3 3z" clipRule="evenodd" />
  </svg>
)

function StatCard({ label, value, icon: Icon, color = '#00ff41' }: { label: string; value: number | string; icon: React.ComponentType; color?: string }) {
  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-6 group">
      <div className="flex items-start justify-between mb-4">
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">{label}</p>
        <div className="w-5 h-5 text-neon-green/50 group-hover:text-neon-green transition-colors flex-shrink-0">
          <Icon />
        </div>
      </div>
      <p className="text-neon-green font-mono text-4xl font-bold text-glow">{value}</p>
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
            <Link 
              href="/admin/tenants" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg glass-panel hover:bg-white/5 border-white/10 text-sm font-mono text-gray-300 hover:text-neon-green hover:border-neon-green/40 transition-all shadow-lg"
            >
              Tenants
              <ArrowRightIcon />
            </Link>
            <Link 
              href="/admin/logs" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg glass-panel hover:bg-white/5 border-white/10 text-sm font-mono text-gray-300 hover:text-neon-green hover:border-neon-green/40 transition-all shadow-lg"
            >
              Audit Log
              <ArrowRightIcon />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
          <StatCard label="Total Agencies" value={metrics.totalAgencies} icon={BuildingIcon} />
          <StatCard label="Posts (Last 30d)" value={metrics.totalPosts} icon={DocumentIcon} />
          <StatCard label="Total Media Files" value={metrics.totalMedia} icon={ImageIcon} />
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
                      <td className="py-3 text-gray-500">{agency.slug}</td>
                      <td className="py-3 text-right text-neon-green font-bold">{agency.postCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-white/5 mb-8">
          <button
            onClick={() => {
              fetch('/api/admin/login', { method: 'DELETE' }).then(() => {
                window.location.href = '/admin/login'
              })
            }}
            className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-red-400 transition-all px-4 py-2.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            <LogoutIcon />
            TERMINATE SESSION
          </button>
        </div>
      </div>
    </div>
  )
}