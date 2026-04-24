'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import type { Lead, LeadStatus } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Phone, Clock } from 'lucide-react';
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

  const filtered = filter === 'all' ? leads : leads.filter((l) => l.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 bg-[#12121a] border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-gray-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
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
        <div className="text-center text-gray-500 py-20">No leads found.</div>
      ) : (
        <Card className="bg-[#12121a] border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Phone</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Message</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
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
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
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
