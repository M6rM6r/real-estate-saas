'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'

type Metrics = {
  totalAgencies: number
  totalPosts: number
  totalMedia: number
  agenciesPerMonth: { month: string; count: number }[]
  topAgencies: { name: string; slug: string; postCount: number }[]
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-[#111] border border-[#00ff41]/20 rounded-lg p-6">
      <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[#00ff41] font-mono text-4xl font-bold">{value}</p>
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
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <p className="text-[#00ff41] font-mono animate-pulse">Loading system data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-mono font-bold text-[#00ff41]">SYSTEM DASHBOARD</h1>
          <div className="flex gap-3">
            <Link href="/admin/tenants" className="text-sm font-mono text-gray-400 hover:text-[#00ff41] transition-colors">
              Tenants →
            </Link>
            <Link href="/admin/logs" className="text-sm font-mono text-gray-400 hover:text-[#00ff41] transition-colors">
              Audit Log →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Agencies" value={metrics.totalAgencies} />
          <StatCard label="Posts (Last 30d)" value={metrics.totalPosts} />
          <StatCard label="Total Media Files" value={metrics.totalMedia} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#111] border border-[#00ff41]/20 rounded-lg p-6">
            <h2 className="font-mono text-sm text-gray-400 uppercase tracking-widest mb-4">
              New Agencies — Last 12 Months
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.agenciesPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="month" stroke="#555" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#555" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid #00ff41', borderRadius: 4, fontFamily: 'monospace' }}
                  labelStyle={{ color: '#00ff41' }}
                />
                <Bar dataKey="count" fill="#00ff41" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#111] border border-[#00ff41]/20 rounded-lg p-6">
            <h2 className="font-mono text-sm text-gray-400 uppercase tracking-widest mb-4">
              Top Agencies by Posts
            </h2>
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th className="text-left pb-2">Agency</th>
                  <th className="text-left pb-2">Slug</th>
                  <th className="text-right pb-2">Posts</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topAgencies?.map((agency, i) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="py-2 text-white">{agency.name}</td>
                    <td className="py-2 text-gray-500">{agency.slug}</td>
                    <td className="py-2 text-right text-[#00ff41]">{agency.postCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              fetch('/api/admin/login', { method: 'DELETE' }).then(() => {
                window.location.href = '/admin/login'
              })
            }}
            className="font-mono text-xs text-gray-600 hover:text-red-400 transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  )
}