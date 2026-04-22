'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Log = {
  id: string
  action: string
  target_id: string | null
  target_type: string | null
  performed_by: string
  metadata: Record<string, unknown> | null
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  admin_login_success: 'text-[#00ff41]',
  admin_login_failed: 'text-red-400',
  tenant_created: 'text-blue-400',
  tenant_updated: 'text-yellow-400',
  tenant_deleted: 'text-red-500',
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<Log[]>([])
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 25

  useEffect(() => {
    fetch('/api/admin/logs')
      .then(res => res.json())
      .then(setLogs)
  }, [])

  const paginated = logs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(logs.length / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-mono font-bold text-[#00ff41]">AUDIT LOG</h1>
          <Link href="/admin/dashboard" className="text-sm font-mono text-gray-400 hover:text-[#00ff41] transition-colors">
            ← Dashboard
          </Link>
        </div>

        <div className="bg-[#111] border border-[#00ff41]/20 rounded-lg overflow-hidden">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-[#00ff41]/20 text-gray-400 text-xs uppercase">
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Target</th>
                <th className="text-left px-4 py-3">Performed By</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(log => (
                <tr key={log.id} className="border-t border-gray-800 hover:bg-white/5">
                  <td className={`px-4 py-3 font-bold ${ACTION_COLORS[log.action] ?? 'text-gray-300'}`}>
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {log.target_type && <span className="text-gray-400">{log.target_type} </span>}
                    {log.target_id && <span className="text-gray-600">{log.target_id.slice(0, 8)}…</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{log.performed_by}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 font-mono text-sm border border-gray-700 text-gray-400 rounded disabled:opacity-30 hover:border-[#00ff41] hover:text-[#00ff41]"
            >
              Prev
            </button>
            <span className="px-3 py-1 font-mono text-sm text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 font-mono text-sm border border-gray-700 text-gray-400 rounded disabled:opacity-30 hover:border-[#00ff41] hover:text-[#00ff41]"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}