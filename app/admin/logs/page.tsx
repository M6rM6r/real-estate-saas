'use client';

import { useEffect, useState } from 'react';
import type { AdminLog } from '@/lib/types';
import { ScrollText, AlertCircle, RefreshCw } from 'lucide-react';

const actionColors: Record<string, string> = {
  create_tenant: 'bg-emerald-500/10 text-emerald-400',
  delete_tenant: 'bg-red-500/10 text-red-400',
  update_tenant: 'bg-blue-500/10 text-blue-400',
  suspend_tenant: 'bg-amber-500/10 text-amber-400',
  login: 'bg-slate-500/10 text-slate-400',
};

function actionBadgeClass(action: string) {
  return actionColors[action] ?? 'bg-slate-500/10 text-slate-400';
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
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-slate-400 text-sm mt-1">All admin actions recorded here</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors text-sm"
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
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <ScrollText className="h-12 w-12 mb-4 text-slate-700" />
          <p className="text-sm">No audit logs recorded yet.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Action', 'Performed By', 'Target', 'Date'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${actionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{log.performed_by}</td>
                    <td className="px-6 py-4">
                      <code className="text-slate-400 text-xs bg-slate-800 px-2 py-0.5 rounded">
                        {log.target_type}/{log.target_id}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(log.created_at).toLocaleString()}
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
