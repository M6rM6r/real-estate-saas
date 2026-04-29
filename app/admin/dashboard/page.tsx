'use client';

import { useEffect, useState } from 'react';
import type { AdminMetrics } from '@/lib/types';
import { Building2, FileText, Image, ExternalLink, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-[#00ff41]/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-[#00ff41]/40 text-center py-20 font-mono">{'> ERROR: Failed to load metrics.'}</p>;
  }

  return (
    <div className="space-y-8 font-mono">
      <div>
        <h1 className="text-2xl font-bold text-[#00ff41]">{'> Overview_'}</h1>
        <p className="text-[#00ff41]/40 text-sm mt-1">Platform-wide metrics and activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Agencies', value: data.totalAgencies, icon: Building2 },
          { label: 'Posts (30d)', value: data.totalPosts, icon: FileText },
          { label: 'Media Files', value: data.totalMedia, icon: Image },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#0d0d0d] border border-[#00ff41]/20 rounded-xl p-5 hover:border-[#00ff41]/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#00ff41]/60">{label}</p>
              <div className="w-8 h-8 rounded-lg bg-[#00ff41]/10 border border-[#00ff41]/20 flex items-center justify-center">
                <Icon className="h-4 w-4 text-[#00ff41]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#00ff41]">{value}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-[#0d0d0d] border border-[#00ff41]/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-4 w-4 text-[#00ff41]" />
          <h2 className="text-sm font-semibold text-[#00ff41]">New Agencies per Month</h2>
        </div>
        {data.agenciesPerMonth?.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.agenciesPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00ff4115" />
                <XAxis dataKey="month" stroke="#00ff4140" fontSize={11} tickLine={false} />
                <YAxis stroke="#00ff4140" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d0d0d',
                    border: '1px solid #00ff4140',
                    borderRadius: '8px',
                    color: '#00ff41',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="count" fill="#00ff41" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[#00ff41]/30 text-center py-12 text-sm">{'> no data available'}</p>
        )}
      </div>

      {/* Top Agencies */}
      {data.topAgencies?.length > 0 && (
        <div className="bg-[#0d0d0d] border border-[#00ff41]/20 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#00ff41]/20">
            <h2 className="text-sm font-semibold text-[#00ff41]">Top Agencies by Posts</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#00ff41]/10">
                <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Agency</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Posts</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Link</th>
              </tr>
            </thead>
            <tbody>
              {data.topAgencies.map((a) => (
                <tr key={a.slug} className="border-b border-[#00ff41]/10 hover:bg-[#00ff41]/5">
                  <td className="px-6 py-3 text-[#00ff41] font-medium">{a.name}</td>
                  <td className="px-6 py-3 text-[#00ff41]/60">{a.postCount}</td>
                  <td className="px-6 py-3 text-right">
                    <a
                      href={`/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#00ff41]/60 hover:text-[#00ff41] text-xs"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All Agencies Monitor */}
      {data.allAgencies?.length > 0 && (
        <div className="bg-[#0d0d0d] border border-[#00ff41]/20 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#00ff41]/20">
            <h2 className="text-sm font-semibold text-[#00ff41]">Agency Activity Monitor</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#00ff41]/10">
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Agency</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Posts</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Joined</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.allAgencies.map((a) => (
                  <tr key={a.id} className="border-b border-[#00ff41]/10 hover:bg-[#00ff41]/5">
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                        a.status === 'active'
                          ? 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30'
                          : 'bg-[#ff4141]/10 text-[#ff4141] border border-[#ff4141]/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'active' ? 'bg-[#00ff41] animate-pulse' : 'bg-[#ff4141]'}`} />
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[#00ff41] font-medium">{a.name}</td>
                    <td className="px-6 py-3 text-[#00ff41]/60">{a.postCount}</td>
                    <td className="px-6 py-3 text-[#00ff41]/60">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <a
                        href={`/${a.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#00ff41]/60 hover:text-[#00ff41] text-xs"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
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
