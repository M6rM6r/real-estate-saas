'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { authHeaders } from '@/lib/firebase-client-auth'

type Analytics = {
  pageViews: { date: string; views: number }[]
  listingViews: { listing: string; views: number }[]
  totalViews: number
  totalLeads: number
}

// Dynamically import chart components to reduce initial bundle size
const LineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false })
const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false })
const BarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), { ssr: false })
const Bar = dynamic(() => import('recharts').then(mod => ({ default: mod.Bar })), { ssr: false })

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  useEffect(() => {
    authHeaders().then(hdrs => {
      if (!hdrs) return
      fetch('/api/dashboard/analytics', { headers: hdrs })
        .then(res => res.json())
        .then(setAnalytics)
    })
  }, [])

  if (!analytics) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Page Views</h3>
          <p className="text-3xl font-bold">{analytics.totalViews}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Leads</h3>
          <p className="text-3xl font-bold">{analytics.totalLeads}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Page Views Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.pageViews}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="views" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top Listings by Views</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.listingViews}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="listing" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="views" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}