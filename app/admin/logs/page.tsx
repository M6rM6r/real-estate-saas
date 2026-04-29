'use client';

import { useEffect, useState } from 'react';
import type { AdminLog } from '@/lib/types';
import { ScrollText, AlertCircle, RefreshCw } from 'lucide-react';

const actionColors: Record<string, string> = {
  create_tenant: 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30',
  delete_tenant: 'bg-[#ff4141]/10 text-[#ff4141] border border-[#ff4141]/30',
  update_tenant: 'bg-[#41b0ff]/10 text-[#41b0ff] border border-[#41b0ff]/30',
  suspend_tenant: 'bg-[#ffb441]/10 text-[#ffb441] border border-[#ffb441]/30',
  login: 'bg-[#00ff41]/5 text-[#00ff41]/50 border border-[#00ff41]/20',
};

function actionBadgeClass(action: string) {
  return actionColors[action] ?? 'bg-[#00ff41]/5 text-[#00ff41]/50 border border-[#00ff41]/20';
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = () => {
    setLoading(true);
    setError(null);
    fetch('/api/admin/logs')
      .then(async (r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json() as Promise<AdminLog[]>;
      })
      .then(setLogs)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchLogs, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-[#00ff41]/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#00ff41]">{'> Audit_Logs'}</h1>
          <p className="text-[#00ff41]/40 text-sm mt-1">All admin actions recorded here</p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          aria-label="تحديث السجلات"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#00ff41]/20 text-[#00ff41]/60 hover:text-[#00ff41] hover:border-[#00ff41]/40 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41]/50"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#00ff41]/30">
          <ScrollText className="h-12 w-12 mb-4 text-[#00ff41]/20" />
          <p className="text-sm">{'> no audit logs recorded'}</p>
        </div>
      ) : (
        <div className="bg-[#0d0d0d] border border-[#00ff41]/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#00ff41]/10">
                  {['Action', 'Performed By', 'Target', 'Date'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-[#00ff41]/10 hover:bg-[#00ff41]/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium ${actionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#00ff41]/80">{log.performed_by}</td>
                    <td className="px-6 py-4">
                      <code className="text-[#00ff41]/60 text-xs bg-[#00ff41]/5 border border-[#00ff41]/10 px-2 py-0.5 rounded">
                        {log.target_type}/{log.target_id}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-[#00ff41]/40 text-xs">
                      {new Date(log.created_at).toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
