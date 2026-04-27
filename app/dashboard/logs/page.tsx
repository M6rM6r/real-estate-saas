'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Loader } from 'lucide-react'

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-500/20 text-green-400',
  update: 'bg-blue-500/20 text-blue-400',
  delete: 'bg-red-500/20 text-red-400',
  publish: 'bg-yellow-500/20 text-yellow-400',
}

const RESOURCE_LABELS: Record<string, string> = {
  listing: 'عقار',
  news: 'خبر',
  announcement: 'إعلان',
  profile: 'الملف الشخصي',
  gallery: 'معرض',
  team: 'الفريق',
}

const ACTION_LABELS: Record<string, string> = {
  create: 'إنشاء',
  update: 'تعديل',
  delete: 'حذف',
  publish: 'نشر',
}

interface LogEntry {
  id: string
  action: string
  resource: string
  resource_id: string
  user_id: string
  created_at: string | null
}

export default function LogsPage() {
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
      .catch(() => setError('فشل في تحميل السجلات'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-blue-400" />
        <h1 className="text-2xl font-bold">سجل التغييرات</h1>
      </div>

      <Card className="bg-[#12121a] border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-300">آخر 50 عملية</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <p className="text-red-400 text-center py-10">{error}</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-500 text-center py-10">لا توجد سجلات بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="text-right py-2 pr-2 font-medium">التاريخ</th>
                    <th className="text-right py-2 font-medium">الإجراء</th>
                    <th className="text-right py-2 font-medium">النوع</th>
                    <th className="text-right py-2 font-medium">المعرّف</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b border-gray-800/50 hover:bg-white/5">
                      <td className="py-2 pr-2 text-gray-400 whitespace-nowrap">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString('ar-SA', {
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
