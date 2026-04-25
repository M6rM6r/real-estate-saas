'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import type { Lead, LeadStatus } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Phone, Clock, Search } from 'lucide-react';
import { LeadStatsCards } from '@/components/LeadStatsCards';

const demoLeads: Lead[] = [
  { id: '1', tenant_id: 'demo', name: 'Ahmed Al-Rashid', phone: '+971501234567', message: 'Interested in the Palm Jumeirah villa. Can I schedule a viewing?', status: 'new', created_at: '2026-04-20T14:30:00Z' },
  { id: '2', tenant_id: 'demo', name: 'Sarah Johnson', phone: '+971559876543', message: 'What is the payment plan for the Downtown apartment?', status: 'contacted', created_at: '2026-04-18T09:15:00Z' },
  { id: '3', tenant_id: 'demo', name: 'Mohammed Hassan', phone: '+971523456789', message: 'Looking for a 3-bedroom property in Marina area.', status: 'new', created_at: '2026-04-15T16:45:00Z' },
  { id: '4', tenant_id: 'demo', name: 'Elena Petrova', phone: '+971547891234', message: 'Is the JBR penthouse still available?', status: 'closed', created_at: '2026-04-10T11:20:00Z' },
  { id: '5', tenant_id: 'demo', name: 'David Chen', phone: '+971567890123', message: 'Need info about rental yields in Dubai Marina.', status: 'contacted', created_at: '2026-04-08T08:00:00Z' },
];

const statusColor: Record<LeadStatus, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  closed: 'bg-green-500/20 text-green-400',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      setLeads(demoLeads);
      setLoading(false);
      return;
    }
    authFetch<Lead[]>('/api/dashboard/leads')
      .then(setLeads)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: LeadStatus) => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
      return;
    }
    try {
      await authFetch(`/api/dashboard/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch {}
  };

  const filteredByStatus = filter === 'all' ? leads : leads.filter((l) => l.status === filter);
  const filtered = query.trim()
    ? filteredByStatus.filter((l) => `${l.name} ${l.phone} ${l.message ?? ''}`.toLowerCase().includes(query.toLowerCase()))
    : filteredByStatus;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">العملاء المحتملين</h1>
        <p className="text-sm text-gray-400">استعراض الاستفسارات وتحديث الحالات وتتبع الأداء.</p>
      </div>

      <div className="sticky top-0 z-20 backdrop-blur bg-[#0a0a0f]/80 border border-gray-800 rounded-xl p-3">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="البحث بالاسم أو الهاتف أو الرسالة"
              className="pl-9 bg-[#12121a] border-gray-700 text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40 bg-[#12121a] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-gray-700">
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="new">جديد</SelectItem>
                <SelectItem value="contacted">تم التواصل</SelectItem>
                <SelectItem value="closed">مغلق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={filter === 'all'}
            aria-label="عرض كل العملاء"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${filter === 'all' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-[#12121a] text-gray-400 border-gray-700 hover:text-white'}`}
          >
            الكل ({leads.length})
          </button>
          <button
            type="button"
            aria-pressed={filter === 'new'}
            aria-label="عرض العملاء الجدد"
            onClick={() => setFilter('new')}
            className={`px-3 py-1 rounded-full text-xs border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${filter === 'new' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-[#12121a] text-gray-400 border-gray-700 hover:text-white'}`}
          >
            جديد ({leads.filter((l) => l.status === 'new').length})
          </button>
          <button
            type="button"
            aria-pressed={filter === 'contacted'}
            aria-label="عرض العملاء الذين تم التواصل معهم"
            onClick={() => setFilter('contacted')}
            className={`px-3 py-1 rounded-full text-xs border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${filter === 'contacted' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' : 'bg-[#12121a] text-gray-400 border-gray-700 hover:text-white'}`}
          >
            تم التواصل ({leads.filter((l) => l.status === 'contacted').length})
          </button>
          <button
            type="button"
            aria-pressed={filter === 'closed'}
            aria-label="عرض العملاء المغلقين"
            onClick={() => setFilter('closed')}
            className={`px-3 py-1 rounded-full text-xs border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${filter === 'closed' ? 'bg-green-500/20 text-green-300 border-green-500/40' : 'bg-[#12121a] text-gray-400 border-gray-700 hover:text-white'}`}
          >
            مغلق ({leads.filter((l) => l.status === 'closed').length})
          </button>
        </div>
      </div>

      <LeadStatsCards
        stats={{
          totalLeads: leads.length,
          newThisWeek: leads.filter((l) => l.status === 'new').length,
          conversionRate: leads.length > 0 ? Math.round((leads.filter((l) => l.status === 'closed').length / leads.length) * 100) : 0,
          avgResponseTime: '< 2h',
          trend: { leadsChange: 12, rateChange: 5 },
        }}
      />

      {filtered.length === 0 ? (
        <Card className="bg-[#12121a] border-gray-800 py-16 text-center">
          <p className="text-gray-300 font-medium">لا يوجد عملاء محتملين</p>
          <p className="text-gray-500 text-sm mt-2">جرب تغيير المرشحات أو مسح البحث.</p>
        </Card>
      ) : (
        <Card className="bg-[#12121a] border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">الاسم</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">الهاتف</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">الرسالة</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">الحالة</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        {lead.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        {lead.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate">
                      {lead.message || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={lead.status}
                        onValueChange={(v) => updateStatus(lead.id, v as LeadStatus)}
                      >
                        <SelectTrigger className="w-28 h-7 text-xs bg-transparent border-gray-700">
                          <Badge className={statusColor[lead.status]}>
                            {lead.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-gray-700">
                          <SelectItem value="new">جديد</SelectItem>
                          <SelectItem value="contacted">تم التواصل</SelectItem>
                          <SelectItem value="closed">مغلق</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
