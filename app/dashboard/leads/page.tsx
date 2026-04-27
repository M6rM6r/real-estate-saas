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
import { Users, Phone, Clock, Search, ChevronLeft, ChevronRight, Copy, Check, Mail, MessageSquare, StickyNote, X, Download } from 'lucide-react';
import { LeadStatsCards } from '@/components/LeadStatsCards';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

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
  qualified: 'bg-purple-500/20 text-purple-400',
  closed: 'bg-green-500/20 text-green-400',
  archived: 'bg-gray-500/20 text-gray-400',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

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

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerNotes, setDrawerNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [copied, setCopied] = useState(false);

  const openLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerNotes(lead.notes ?? '');
  };

  const saveNotes = async () => {
    if (!selectedLead) return;
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    setSavingNotes(true);
    try {
      if (!isDemo) {
        await authFetch(`/api/dashboard/leads/${selectedLead.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ notes: drawerNotes }),
        });
      }
      setLeads(leads.map((l) => l.id === selectedLead.id ? { ...l, notes: drawerNotes } : l));
      setSelectedLead(prev => prev ? { ...prev, notes: drawerNotes } : null);
    } catch {}
    finally { setSavingNotes(false); }
  };

  const copyPhone = () => {
    if (!selectedLead) return;
    navigator.clipboard.writeText(selectedLead.phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filteredByStatus = filter === 'all' ? leads : leads.filter((l) => l.status === filter);
  const filtered = query.trim()
    ? filteredByStatus.filter((l) => `${l.name} ${l.phone} ${l.message ?? ''}`.toLowerCase().includes(query.toLowerCase()))
    : filteredByStatus;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportCsv = () => {
    const rows = [
      ['التاريخ', 'الاسم', 'الهاتف', 'البريد الإلكتروني', 'الرسالة', 'الحالة'],
      ...filtered.map((l) => [
        new Date(l.created_at).toLocaleDateString('ar-SA'),
        l.name,
        l.phone,
        l.email ?? '',
        (l.message ?? '').replace(/\n/g, ' '),
        l.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">العملاء المحتملين</h1>
          <p className="text-sm text-gray-400">استعراض الاستفسارات وتحديث الحالات وتتبع الأداء.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="shrink-0 border-gray-700 bg-[#12121a] text-gray-300 hover:text-white disabled:opacity-40"
          title={filtered.length === 0 ? 'لا يوجد عملاء للتصدير' : undefined}
        >
          <Download className="h-4 w-4 mr-1.5" />
          تصدير CSV
        </Button>
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
                <SelectItem value="qualified">مؤهل</SelectItem>
                <SelectItem value="closed">مغلق</SelectItem>
                <SelectItem value="archived">مؤرشف</SelectItem>
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
        <>
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span>
              عرض {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} من {filtered.length}
            </span>
          </div>
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
                  {paginated.map((lead) => (
                    <tr key={lead.id} onClick={() => openLead(lead)} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer">
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
                            <SelectItem value="qualified">مؤهل</SelectItem>
                            <SelectItem value="closed">مغلق</SelectItem>
                            <SelectItem value="archived">مؤرشف</SelectItem>
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
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-gray-700 bg-[#12121a] text-gray-400 hover:text-white"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
                aria-label="الصفحة السابقة"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 border-gray-700 ${p === safePage ? 'bg-blue-600 text-white border-blue-600' : 'bg-[#12121a] text-gray-400 hover:text-white'}`}
                  onClick={() => setPage(p)}
                  aria-current={p === safePage ? 'page' : undefined}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-gray-700 bg-[#12121a] text-gray-400 hover:text-white"
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
                aria-label="الصفحة التالية"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Lead Detail Drawer */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="bg-[#12121a] border-gray-800 text-white w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white text-lg">{selectedLead?.name}</SheetTitle>
          </SheetHeader>
          {selectedLead && (
            <div className="space-y-5">
              {/* Phone */}
              <div className="flex items-center justify-between bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span dir="ltr">{selectedLead.phone}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 px-2" onClick={copyPhone}>
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              {/* Email */}
              {selectedLead.email && (
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{selectedLead.email}</span>
                </div>
              )}

              {/* Message */}
              {selectedLead.message && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">الرسالة</p>
                  <div className="bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300 flex gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                    <p>{selectedLead.message}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">الحالة</p>
                <Select
                  value={selectedLead.status}
                  onValueChange={(v) => {
                    updateStatus(selectedLead.id, v as LeadStatus);
                    setSelectedLead(prev => prev ? { ...prev, status: v as LeadStatus } : null);
                  }}
                >
                  <SelectTrigger className="bg-[#1a1a2e] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-gray-700">
                    <SelectItem value="new">جديد</SelectItem>
                    <SelectItem value="contacted">تم التواصل</SelectItem>
                    <SelectItem value="qualified">مؤهل</SelectItem>
                    <SelectItem value="closed">مغلق</SelectItem>
                    <SelectItem value="archived">مؤرشف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <StickyNote className="h-3.5 w-3.5" /> الملاحظات
                </p>
                {/* WhatsApp Quick Replies */}
                {selectedLead.phone && (
                  <div className="mb-3 space-y-1.5">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                      <MessageSquare className="h-3.5 w-3.5 text-green-400" />
                      <span className="text-green-400">ردود واتساب السريعة</span>
                    </p>
                    {[
                      'شكراً على تواصلك، سيتصل بك أحد ممثلينا قريباً.',
                      'هل يمكنك تحديد وقت مناسب للمعاينة؟',
                      'العقار لا يزال متاحاً، يسعدنا مساعدتك.',
                    ].map((template) => (
                      <button
                        key={template}
                        onClick={() => window.open(`https://wa.me/${selectedLead.phone!.replace(/[\s\-+]/g, '')}?text=${encodeURIComponent(template)}`, '_blank', 'noopener,noreferrer')}
                        className="w-full text-right text-xs bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-300 rounded px-3 py-1.5 transition-colors"
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                )}
                <Textarea
                  value={drawerNotes}
                  onChange={(e) => setDrawerNotes(e.target.value)}
                  placeholder="أضف ملاحظاتك هنا..."
                  rows={5}
                  className="bg-[#1a1a2e] border-gray-700 text-white resize-none"
                />
                <Button
                  onClick={saveNotes}
                  disabled={savingNotes || drawerNotes === (selectedLead.notes ?? '')}
                  size="sm"
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
                >
                  {savingNotes ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
                </Button>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {new Date(selectedLead.created_at).toLocaleString('ar-SA')}
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
