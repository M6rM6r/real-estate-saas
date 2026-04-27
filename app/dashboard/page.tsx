'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api';
import type { AnalyticsData, Lead, Post } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, TrendingUp, Phone, MapPin } from 'lucide-react';
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
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentListings, setRecentListings] = useState<Post[]>([]);

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

  useEffect(() => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      setRecentLeads([
        { id: '1', tenant_id: 'demo', name: 'Ahmed Al-Rashid', phone: '+971501234567', message: '', status: 'new', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', tenant_id: 'demo', name: 'Sarah Johnson', phone: '+971559876543', message: '', status: 'contacted', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', tenant_id: 'demo', name: 'Mohammed Hassan', phone: '+971523456789', message: '', status: 'new', created_at: new Date(Date.now() - 172800000).toISOString() },
      ]);
      setRecentListings([
        { id: '1', tenant_id: 'demo', type: 'listing', title: 'Luxury Villa in Palm Jumeirah', body: '', price: 12500000, listing_status: 'available', published: true, images: [], created_at: new Date(Date.now() - 86400000).toISOString() } as Post,
        { id: '2', tenant_id: 'demo', type: 'listing', title: 'Modern Downtown Apartment', body: '', price: 3200000, listing_status: 'available', published: true, images: [], created_at: new Date(Date.now() - 172800000).toISOString() } as Post,
        { id: '3', tenant_id: 'demo', type: 'listing', title: 'Beachfront Penthouse', body: '', price: 8900000, listing_status: 'sold', published: true, images: [], created_at: new Date(Date.now() - 259200000).toISOString() } as Post,
      ]);
      return;
    }
    authFetch<Lead[]>('/api/dashboard/leads').then(leads => setRecentLeads(leads.slice(0, 5))).catch(() => {});
    authFetch<{ data: Post[] }>('/api/dashboard/listings').then(res => setRecentListings((res.data || []).slice(0, 5))).catch(() => {});
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

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Leads */}
        <Card className="bg-[#12121a] border-gray-800">
          <CardHeader className="border-b border-gray-800/60 pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-semibold">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-400" />
                أحدث العملاء
              </span>
              <button
                onClick={() => router.push('/dashboard/leads')}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                عرض الكل
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentLeads.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">لا توجد عملاء بعد</p>
            ) : (
              <ul>
                {recentLeads.map((lead, i) => (
                  <li
                    key={lead.id}
                    onClick={() => router.push('/dashboard/leads')}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors ${i < recentLeads.length - 1 ? 'border-b border-gray-800/50' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-400">{lead.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />{lead.phone}
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-xs shrink-0 ${lead.status === 'new' ? 'bg-blue-500/20 text-blue-400' : lead.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {lead.status === 'new' ? 'جديد' : lead.status === 'contacted' ? 'تم التواصل' : 'مغلق'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Listings */}
        <Card className="bg-[#12121a] border-gray-800">
          <CardHeader className="border-b border-gray-800/60 pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-semibold">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-400" />
                آخر العقارات
              </span>
              <button
                onClick={() => router.push('/dashboard/listings')}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                عرض الكل
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentListings.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">لا توجد عقارات بعد</p>
            ) : (
              <ul>
                {recentListings.map((listing, i) => (
                  <li
                    key={listing.id}
                    onClick={() => router.push('/dashboard/listings')}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors ${i < recentListings.length - 1 ? 'border-b border-gray-800/50' : ''}`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-sm font-medium text-white truncate">{listing.title}</p>
                      {listing.price != null && (
                        <p className="text-xs text-blue-400 font-semibold">{listing.price.toLocaleString()} SAR</p>
                      )}
                    </div>
                    <Badge className={`text-xs shrink-0 ${listing.listing_status === 'available' ? 'bg-green-500/20 text-green-400' : listing.listing_status === 'sold' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {listing.listing_status === 'available' ? 'متاح' : listing.listing_status === 'sold' ? 'مباع' : 'مؤجر'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
