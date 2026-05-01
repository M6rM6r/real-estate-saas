'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authFetch } from '@/lib/api';
import type { Lead, Post } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Phone, MapPin } from 'lucide-react';

export default function DashboardOverview() {
  const router = useRouter();
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentListings, setRecentListings] = useState<Post[]>([]);

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">نظرة عامة</h1>
          <p className="text-sm text-gray-400">تابع آخر الاستفسارات والعقارات المنشورة.</p>
        </div>
        <Link href="/dashboard/page-builder" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
          محرر الصفحة
        </Link>
      </div>

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
              <Link
                href="/dashboard/leads"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                عرض الكل
              </Link>
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
                        <span className="text-xs font-bold text-blue-400">{([...lead.name][0] || '?').toUpperCase()}</span>
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
              <Link
                href="/dashboard/listings"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                عرض الكل
              </Link>
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
                        <p className="text-xs text-blue-400 font-semibold">{listing.price.toLocaleString('en-US')} SAR</p>
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
