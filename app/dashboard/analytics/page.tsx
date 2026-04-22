'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

type Analytics = {
  pageViews: { date: string; views: number }[]
  listingViews: { listing: string; views: number }[]
  totalViews: number
  totalLeads: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/analytics')
      .then(res => res.json())
      .then(setAnalytics)
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