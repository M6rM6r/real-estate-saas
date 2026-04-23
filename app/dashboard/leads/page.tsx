'use client'

import { useEffect, useState, useCallback } from 'react'
import { authHeaders } from '@/lib/firebase-client-auth'

type Lead = {
  id: string
  name: string
  phone: string
  email: string | null
  message: string | null
  status: 'new' | 'contacted' | 'closed'
  listing_id: string | null
  createdAt: string | { seconds: number }
}

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-green-100 text-green-700',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const hdrs = await authHeaders()
    if (!hdrs) return
    const res = await fetch('/api/dashboard/leads', {
      headers: hdrs,
    })
    const json = await res.json()
    setLeads(json ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: Lead['status']) => {
    const hdrs = await authHeaders()
    if (!hdrs) return
    await fetch(`/api/dashboard/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...hdrs },
      body: JSON.stringify({ status }),
    })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  if (loading) return (
    <div className="p-8 space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <span className="text-sm text-gray-500">{leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
      </div>

      {!leads.length ? (
        <p className="text-center text-gray-400 py-12">No leads yet. Share your public page to get enquiries.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Message</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {lead.name}
                    {lead.email && <div className="text-xs text-gray-400">{lead.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs">
                    <span className="line-clamp-2">{lead.message ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{typeof lead.createdAt === 'object' && lead.createdAt !== null && 'seconds' in lead.createdAt ? new Date((lead.createdAt as {seconds: number}).seconds * 1000).toLocaleDateString() : new Date(lead.createdAt as string).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.status}
                      onChange={e => updateStatus(lead.id, e.target.value as Lead['status'])}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLORS[lead.status]}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
