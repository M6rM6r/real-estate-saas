'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import type { AnalyticsData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const demoData: AnalyticsData = {
  pageViews: [
    { date: '2025-10', views: 120 },
    { date: '2025-11', views: 245 },
    { date: '2025-12', views: 312 },
    { date: '2026-01', views: 287 },
    { date: '2026-02', views: 410 },
    { date: '2026-03', views: 523 },
    { date: '2026-04', views: 478 },
  ],
  totalViews: 2375,
  totalLeads: 42,
};

export default function DashboardOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      setData(demoData);
      setLoading(false);
      return;
    }
    authFetch<AnalyticsData>('/api/dashboard/analytics')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-400 py-20">
        Unable to load analytics data.
      </div>
    );
  }

  const chartData = data.pageViews.map((pv) => ({
    date: pv.date,
    views: pv.views,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Overview</h1>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="bg-[#12121a] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Page Views
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#12121a] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Leads
            </CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalLeads.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#12121a] border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Page Views Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">No view data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
