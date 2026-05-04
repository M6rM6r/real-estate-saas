'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Loader } from 'lucide-react'
import { useLanguage } from '@/app/dashboard/LanguageContext'

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-500/20 text-green-400',
  update: 'bg-blue-500/20 text-blue-400',
  delete: 'bg-red-500/20 text-red-400',
  publish: 'bg-yellow-500/20 text-yellow-400',
}

const LOGS_T = {
  ar: {
    pageTitle: 'سجل التغييرات', last50: 'آخر 50 عملية',
    loadFailed: 'فشل في تحميل السجلات', noLogs: 'لا توجد سجلات بعد',
    colDate: 'التاريخ', colAction: 'الإجراء', colType: 'النوع', colId: 'المعرّف',
    rListing: 'عقار', rNews: 'خبر', rAnnouncement: 'إعلان', rProfile: 'الملف الشخصي', rGallery: 'معرض', rTeam: 'الفريق',
    aCreate: 'إنشاء', aUpdate: 'تعديل', aDelete: 'حذف', aPublish: 'نشر',
  },
  en: {
    pageTitle: 'Activity Log', last50: 'Last 50 actions',
    loadFailed: 'Failed to load logs', noLogs: 'No logs yet',
    colDate: 'Date', colAction: 'Action', colType: 'Type', colId: 'ID',
    rListing: 'Listing', rNews: 'News', rAnnouncement: 'Announcement', rProfile: 'Profile', rGallery: 'Gallery', rTeam: 'Team',
    aCreate: 'Create', aUpdate: 'Update', aDelete: 'Delete', aPublish: 'Publish',
  },
};

interface LogEntry {
  id: string
  action: string
  resource: string
  resource_id: string
  user_id: string
  created_at: string | null
}

export default function LogsPage() {
  const { lang } = useLanguage()
  const t = LOGS_T[lang]
  const RESOURCE_LABELS: Record<string, string> = {
    listing: t.rListing, news: t.rNews, announcement: t.rAnnouncement,
    profile: t.rProfile, gallery: t.rGallery, team: t.rTeam,
  }
  const ACTION_LABELS: Record<string, string> = {
    create: t.aCreate, update: t.aUpdate, delete: t.aDelete, publish: t.aPublish,
  }
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/logs')
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setLogs(data.logs ?? [])
      })
      .catch(() => setError(t.loadFailed))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-blue-400" />
        <h1 className="text-2xl font-bold">{t.pageTitle}</h1>
      </div>

      <Card className="bg-[#12121a] border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-300">{t.last50}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <p className="text-red-400 text-center py-10">{error}</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-500 text-center py-10">{t.noLogs}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="text-right py-2 pr-2 font-medium">{t.colDate}</th>
                    <th className="text-right py-2 font-medium">{t.colAction}</th>
                    <th className="text-right py-2 font-medium">{t.colType}</th>
                    <th className="text-right py-2 font-medium">{t.colId}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b border-gray-800/50 hover:bg-white/5">
                      <td className="py-2 pr-2 text-gray-400 whitespace-nowrap">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString('en-US', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </td>
                      <td className="py-2">
                        <Badge className={`${ACTION_COLORS[log.action] ?? 'bg-gray-500/20 text-gray-400'} border-0`}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </Badge>
                      </td>
                      <td className="py-2 text-gray-300">
                        {RESOURCE_LABELS[log.resource] ?? log.resource}
                      </td>
                      <td className="py-2 text-gray-500 font-mono text-xs truncate max-w-[140px]">
                        {log.resource_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
