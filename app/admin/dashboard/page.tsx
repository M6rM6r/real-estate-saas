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
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-slate-500 text-center py-20">Failed to load metrics.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Platform-wide metrics and activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Agencies', value: data.totalAgencies, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Posts (30d)', value: data.totalPosts, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Media Files', value: data.totalMedia, icon: Image, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400">{label}</p>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white">New Agencies per Month</h2>
        </div>
        {data.agenciesPerMonth?.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.agenciesPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-12 text-sm">No data available yet.</p>
        )}
      </div>

      {/* Top Agencies */}
      {data.topAgencies?.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white">Top Agencies by Posts</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Agency</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Posts</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Link</th>
              </tr>
            </thead>
            <tbody>
              {data.topAgencies.map((a) => (
                <tr key={a.slug} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="px-6 py-3 text-white font-medium">{a.name}</td>
                  <td className="px-6 py-3 text-slate-400">{a.postCount}</td>
                  <td className="px-6 py-3 text-right">
                    <a
                      href={`/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white">Agency Activity Monitor</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Agency</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Posts</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Joined</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.allAgencies.map((a) => (
                  <tr key={a.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-white font-medium">{a.name}</td>
                    <td className="px-6 py-3 text-slate-400">{a.postCount}</td>
                    <td className="px-6 py-3 text-slate-400">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <a
                        href={`/${a.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
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
        <div className="h-8 w-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-[#00ff41]/60 text-center py-20">Failed to load metrics.</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-wider">{'>'} SYSTEM_OVERVIEW</h1>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-[#111] border-[#00ff41]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#00ff41]/60 uppercase tracking-wider">
              Total Agencies
            </CardTitle>
            <Building2 className="h-4 w-4 text-[#00ff41]/60" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#00ff41]">{data.totalAgencies}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#111] border-[#00ff41]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#00ff41]/60 uppercase tracking-wider">
              Posts (30d)
            </CardTitle>
            <FileText className="h-4 w-4 text-[#00ff41]/60" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#00ff41]">{data.totalPosts}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#111] border-[#00ff41]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#00ff41]/60 uppercase tracking-wider">
              Media Files
            </CardTitle>
            <Image className="h-4 w-4 text-[#00ff41]/60" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#00ff41]">{data.totalMedia}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="bg-[#111] border-[#00ff41]/20">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#00ff41]/80 uppercase tracking-wider">
            New Agencies / Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.agenciesPerMonth?.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.agenciesPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="month" stroke="#00ff4180" fontSize={11} tickLine={false} />
                  <YAxis stroke="#00ff4180" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111',
                      border: '1px solid #00ff4140',
                      borderRadius: '4px',
                      color: '#00ff41',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Bar dataKey="count" fill="#00ff41" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-[#00ff41]/40 text-center py-12 text-sm">No data available.</p>
          )}
        </CardContent>
      </Card>

      {/* Top Agencies */}
      {data.topAgencies?.length > 0 && (
        <Card className="bg-[#111] border-[#00ff41]/20">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-[#00ff41]/80 uppercase tracking-wider">
              Top Agencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#00ff41]/20">
                  <th className="text-left py-2 text-[#00ff41]/60 font-bold text-xs uppercase">Name</th>
                  <th className="text-left py-2 text-[#00ff41]/60 font-bold text-xs uppercase">Posts</th>
                  <th className="text-right py-2 text-[#00ff41]/60 font-bold text-xs uppercase">Link</th>
                </tr>
              </thead>
              <tbody>
                {data.topAgencies.map((a) => (
                  <tr key={a.slug} className="border-b border-[#00ff41]/10 hover:bg-[#00ff41]/5">
                    <td className="py-2 text-[#00ff41]">{a.name}</td>
                    <td className="py-2 text-[#00ff41]/60">{a.postCount}</td>
                    <td className="py-2 text-right">
                      <a
                        href={`/${a.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00ff41]/60 hover:text-[#00ff41] inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Agency Activity Monitor */}
      {data.allAgencies?.length > 0 && (
        <Card className="bg-[#111] border-[#00ff41]/20">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-[#00ff41]/80 uppercase tracking-wider">
              Agency Activity Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#00ff41]/20">
                    <th className="text-left py-2 text-[#00ff41]/60 font-bold text-xs uppercase">Status</th>
                    <th className="text-left py-2 text-[#00ff41]/60 font-bold text-xs uppercase">Agency</th>
                    <th className="text-left py-2 text-[#00ff41]/60 font-bold text-xs uppercase">Posts</th>
                    <th className="text-left py-2 text-[#00ff41]/60 font-bold text-xs uppercase">Joined</th>
                    <th className="text-right py-2 text-[#00ff41]/60 font-bold text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.allAgencies.map((a) => (
                    <tr key={a.id} className="border-b border-[#00ff41]/10 hover:bg-[#00ff41]/5">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              a.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                            }`}
                          />
                          <span
                            className={`text-xs font-bold uppercase ${
                              a.status === 'active' ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 text-[#00ff41]">{a.name}</td>
                      <td className="py-2 text-[#00ff41]/60">{a.postCount}</td>
                      <td className="py-2 text-[#00ff41]/40">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 text-right space-x-2">
                        <a
                          href={`/${a.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00ff41]/60 hover:text-[#00ff41] text-xs inline-flex items-center gap-1"
                        >
                          View Page <ExternalLink className="h-3 w-3" />
                        </a>
                        <button
                          onClick={() => window.location.href = `/admin/tenants?edit=${a.id}`}
                          className="text-[#00ff41]/60 hover:text-[#00ff41] text-xs"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
