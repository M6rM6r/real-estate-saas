'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { authFetch } from '@/lib/api'
import { TrendingUp, Users, Eye, BarChart2 } from 'lucide-react'

type Analytics = {
  pageViews: { date: string; views: number }[]
  listingViews: { listing: string; views: number }[]
  totalViews: number
  totalLeads: number
}

const LineChart = dynamic(() => import('recharts').then(m => ({ default: m.LineChart })), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => ({ default: m.Line })), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => ({ default: m.XAxis })), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => ({ default: m.YAxis })), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => ({ default: m.CartesianGrid })), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => ({ default: m.Tooltip })), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })), { ssr: false })

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    authFetch<Analytics>('/api/dashboard/analytics')
      .then(setAnalytics)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        {error || 'فشل تحميل الإحصائيات'}
      </div>
    )
  }

  const hasViews = analytics.pageViews.length > 0

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">الإحصائيات</h1>
        <p className="text-sm text-slate-400 mt-0.5">نظرة عامة على أداء صفحتك</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
            <Eye className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">إجمالي المشاهدات</p>
            <p className="text-2xl font-bold text-white mt-0.5">{analytics.totalViews.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">إجمالي العملاء المحتملين</p>
            <p className="text-2xl font-bold text-white mt-0.5">{analytics.totalLeads.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Page views chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          <p className="text-sm font-semibold text-white">المشاهدات بمرور الوقت</p>
        </div>
        {hasViews ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analytics.pageViews} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-slate-600">
            <BarChart2 className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">لا توجد بيانات مشاهدات بعد</p>
            <p className="text-xs text-slate-700 mt-1">ستظهر البيانات بعد أن يزور الزوار صفحتك العامة</p>
          </div>
        )}
      </div>
    </div>
  )
}