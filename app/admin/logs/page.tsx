'use client';

import { useEffect, useState } from 'react';
import type { AdminLog } from '@/lib/types';
import { ScrollText } from 'lucide-react';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/logs')
      .then((r) => r.json())
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-wider">{'>'} AUDIT_LOGS</h1>

      {logs.length === 0 ? (
        <div className="text-center text-[#00ff41]/40 py-20">
          <ScrollText className="h-12 w-12 mx-auto mb-4 text-[#00ff41]/20" />
          No logs recorded.
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#00ff41]/20 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#00ff41]/20 bg-[#111]">
                <th className="text-left px-4 py-3 text-[#00ff41]/60 font-bold text-xs uppercase">Action</th>
                <th className="text-left px-4 py-3 text-[#00ff41]/60 font-bold text-xs uppercase">By</th>
                <th className="text-left px-4 py-3 text-[#00ff41]/60 font-bold text-xs uppercase">Target</th>
                <th className="text-left px-4 py-3 text-[#00ff41]/60 font-bold text-xs uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-[#00ff41]/10 hover:bg-[#00ff41]/5">
                  <td className="px-4 py-3 text-[#00ff41] font-mono text-xs">{log.action}</td>
                  <td className="px-4 py-3 text-[#00ff41]/60 font-mono text-xs">{log.performed_by}</td>
                  <td className="px-4 py-3 text-[#00ff41]/40 font-mono text-xs">
                    {log.target_type}/{log.target_id}
                  </td>
                  <td className="px-4 py-3 text-[#00ff41]/40 text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
