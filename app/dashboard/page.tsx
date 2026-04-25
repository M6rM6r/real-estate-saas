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
  const latestViews = chartData.length > 0 ? chartData[chartData.length - 1].views : 0;
  const previousViews = chartData.length > 1 ? chartData[chartData.length - 2].views : latestViews;
  const viewsTrend = previousViews > 0 ? Math.round(((latestViews - previousViews) / previousViews) * 100) : 0;
  const conversionRate = data.totalViews > 0 ? Math.round((data.totalLeads / data.totalViews) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">نظرة عامة</h1>
        <p className="text-sm text-gray-400">تتبع نمو الجمهور وأداء العملاء المحتملين.</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[#12121a] to-[#17172a] border-gray-800 hover:border-blue-500/30 transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              إجمالي المشاهدات
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalViews.toLocaleString()}</p>
            <p className={`mt-2 text-xs ${viewsTrend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {viewsTrend >= 0 ? '+' : ''}{viewsTrend}% مقارنة بالفترة السابقة
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#12121a] to-[#17172a] border-gray-800 hover:border-green-500/30 transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              إجمالي العملاء المحتملين
            </CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalLeads.toLocaleString()}</p>
            <p className="mt-2 text-xs text-gray-400">استفسارات مؤهلة من جميع القنوات</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#12121a] to-[#17172a] border-gray-800 hover:border-violet-500/30 transition-all duration-200 hover:-translate-y-0.5 sm:col-span-2 xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              معدل التحويل
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{conversionRate}%</p>
            <p className="mt-2 text-xs text-gray-400">بناءً على إجمالي المشاهدات والعملاء المسجلين</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#12121a] border-gray-800 shadow-lg shadow-black/20">
        <CardHeader className="border-b border-gray-800/60">
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            المشاهدات عبر الوقت
            </span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/15 text-blue-300">
              آخر {chartData.length} فترة
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-72 pt-2">
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
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">لا توجد بيانات مشاهدات بعد.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
