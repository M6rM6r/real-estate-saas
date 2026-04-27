'use client'

import { useEffect, useState } from 'react'
import { authFetch } from '@/lib/api'
import { TrendingUp, Users, Eye, BarChart2, Trophy } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Period = '7d' | '30d' | '12m'

type Analytics = {
  pageViews: { date: string; views: number }[]
  listingViews: { listing: string; views: number }[]
  totalViews: number
  totalLeads: number
  period?: Period
  labelFormat?: 'day' | 'month'
}

const PERIODS: { key: Period; label: string }[] = [
  { key: '7d', label: '7 أيام' },
  { key: '30d', label: '30 يوم' },
  { key: '12m', label: '12 شهر' },
]

function formatXLabel(date: string, fmt: 'day' | 'month' | undefined) {
  if (!fmt || fmt === 'month') {
    const [y, m] = date.split('-')
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('ar-SA', { month: 'short', year: '2-digit' })
  }
  const [, m, d] = date.split('-')
  return `${d}/${m}`
}

const demoBase: Omit<Analytics, 'pageViews'> = {
  listingViews: [
    { listing: 'Luxury Villa in Palm Jumeirah', views: 143 },
    { listing: 'Modern Downtown Apartment', views: 98 },
    { listing: 'Beachfront Penthouse', views: 76 },
  ],
  totalViews: 480,
  totalLeads: 12,
}

const demoPageViews: Record<Period, Analytics['pageViews']> = {
  '7d': Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000)
    return { date: d.toISOString().slice(0, 10), views: 40 + Math.round(Math.random() * 60) }
  }),
  '30d': Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000)
    return { date: d.toISOString().slice(0, 10), views: 20 + Math.round(Math.random() * 80) }
  }),
  '12m': Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.now() - (11 - i) * 30 * 86400000)
    return { date: d.toISOString().slice(0, 7), views: 100 + Math.round(Math.random() * 300) }
  }),
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<Period>('30d')
  const [isDemo, setIsDemo] = useState(false)
  const [topListings, setTopListings] = useState<{ listingId: string; title: string; views: number }[]>([])

  useEffect(() => {
    const demo = sessionStorage.getItem('demo_auth') === 'true'
    setIsDemo(demo)
    if (demo) {
      setAnalytics({ ...demoBase, pageViews: demoPageViews[period], period, labelFormat: period === '12m' ? 'month' : 'day' })
      setTopListings([
        { listingId: 'demo1', title: 'Palm Jumeirah Villa', views: 312 },
        { listingId: 'demo2', title: 'Downtown Dubai Penthouse', views: 241 },
        { listingId: 'demo3', title: 'Dubai Marina 3BR', views: 178 },
        { listingId: 'demo4', title: 'JBR Beachfront Apt', views: 134 },
        { listingId: 'demo5', title: 'Emirates Hills Mansion', views: 97 },
      ])
      setLoading(false)
      return
    }
    setLoading(true)
    authFetch<Analytics>(`/api/dashboard/analytics?period=${period}`)
      .then(setAnalytics)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [period])

  useEffect(() => {
    const demo = sessionStorage.getItem('demo_auth') === 'true'
    if (demo) return
    authFetch<{ listingId: string; title: string; views: number }[]>('/api/dashboard/analytics/top-listings')
      .then(setTopListings)
      .catch(() => {})
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
  const conversionRate = analytics.totalViews > 0
    ? ((analytics.totalLeads / analytics.totalViews) * 100).toFixed(1)
    : '0.0'
  const labelFmt = analytics.labelFormat ?? (period === '12m' ? 'month' : 'day')

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">الإحصائيات</h1>
          <p className="text-sm text-slate-400 mt-0.5">نظرة عامة على أداء صفحتك</p>
        </div>
        {/* Period toggle */}
        <div className="flex rounded-lg overflow-hidden border border-slate-700 shrink-0">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p.key ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
            <Eye className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">إجمالي المشاهدات</p>
            <p className="text-2xl font-bold text-white mt-0.5">{analytics.totalViews.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">إجمالي العملاء المحتملين</p>
            <p className="text-2xl font-bold text-white mt-0.5">{analytics.totalLeads.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">معدل التحويل</p>
            <p className="text-2xl font-bold text-white mt-0.5">{conversionRate}%</p>
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
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatXLabel(v, labelFmt)}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }}
                labelStyle={{ color: '#94a3b8' }}
                labelFormatter={(v) => formatXLabel(String(v), labelFmt)}
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

      {/* Top performing listings */}
      {topListings.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <p className="text-sm font-semibold text-white">أعلى العقارات مشاهدةً</p>
          </div>
          <div className="space-y-3">
            {topListings.map((item, idx) => {
              const maxViews = topListings[0]?.views ?? 1
              const pct = Math.round((item.views / maxViews) * 100)
              return (
                <div key={item.listingId} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-5 text-center">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.title}</p>
                    <div className="mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {item.views.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}