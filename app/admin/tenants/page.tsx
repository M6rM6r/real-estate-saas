'use client'

import { useEffect, useState } from 'react'

type Tenant = {
  id: string
  slug: string
  name: string
  status: string
  created_at: string
  agentCount: number
  postCount: number
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [editTenant, setEditTenant] = useState<Tenant | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', email: '', tempPassword: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () =>
    fetch('/api/admin/tenants').then(r => r.json()).then(setTenants)

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setShowCreate(false)
      setForm({ name: '', slug: '', email: '', tempPassword: '' })
      setMsg('Agency created successfully')
      load()
    } else {
      setMsg(data.error ?? 'Error creating agency')
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTenant) return
    setLoading(true)
    const res = await fetch(`/api/admin/tenants/${editTenant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editTenant.name, slug: editTenant.slug, status: editTenant.status }),
    })
    setLoading(false)
    if (res.ok) {
      setEditTenant(null)
      setMsg('Agency updated')
      load()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    await fetch(`/api/admin/tenants/${deleteId}`, { method: 'DELETE' })
    setLoading(false)
    setDeleteId(null)
    setMsg('Agency deleted')
    load()
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-mono font-bold text-[#00ff41]">TENANT MANAGEMENT</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#00ff41] text-black font-mono text-sm font-bold px-4 py-2 rounded hover:bg-[#00cc34] transition-colors"
          >
            + CREATE AGENCY
          </button>
        </div>

        {msg && (
          <div className="mb-4 p-3 bg-[#001a00] border border-[#00ff41]/40 rounded font-mono text-[#00ff41] text-sm">
            {msg}
          </div>
        )}

        <div className="bg-[#111] border border-[#00ff41]/20 rounded-lg overflow-hidden">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-[#00ff41]/20 text-gray-400 text-xs uppercase">
                <th className="text-left px-4 py-3">Agency</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Agents</th>
                <th className="text-right px-4 py-3">Posts</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} className="border-t border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white">{t.name}</td>
                  <td className="px-4 py-3 text-gray-400">/{t.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.status === 'active' ? 'bg-[#001a00] text-[#00ff41]' : 'bg-[#1a0000] text-red-400'}`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">{t.agentCount}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{t.postCount}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => setEditTenant(t)}
                      className="text-xs text-gray-400 hover:text-[#00ff41] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(t.id)}
                      className="text-xs text-red-600 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-[#00ff41]/30 rounded-xl p-8 w-full max-w-md">
            <h2 className="font-mono font-bold text-[#00ff41] mb-6">CREATE AGENCY</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: 'Agency Name', key: 'name', type: 'text' },
                { label: 'Slug', key: 'slug', type: 'text' },
                { label: 'Admin Email', key: 'email', type: 'email' },
                { label: 'Temp Password', key: 'tempPassword', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-mono text-gray-400 mb-1">{f.label.toUpperCase()}</label>
                  <input
                    type={f.type}
                    required
                    value={form[f.key as keyof typeof form]}
                    onChange={e => {
                      const val = e.target.value
                      setForm(prev => ({
                        ...prev,
                        [f.key]: val,
                        ...(f.key === 'name' ? { slug: slugify(val) } : {}),
                      }))
                    }}
                    className="w-full bg-[#1a1a1a] border border-gray-700 text-white font-mono rounded px-3 py-2 focus:outline-none focus:border-[#00ff41] text-sm"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-[#00ff41] text-black font-mono font-bold py-2 rounded hover:bg-[#00cc34] disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-gray-700 text-gray-400 font-mono py-2 rounded hover:border-gray-500">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTenant && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-[#00ff41]/30 rounded-xl p-8 w-full max-w-md">
            <h2 className="font-mono font-bold text-[#00ff41] mb-6">EDIT AGENCY</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">NAME</label>
                <input
                  type="text"
                  value={editTenant.name}
                  onChange={e => setEditTenant({ ...editTenant, name: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 text-white font-mono rounded px-3 py-2 focus:outline-none focus:border-[#00ff41] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">SLUG</label>
                <input
                  type="text"
                  value={editTenant.slug}
                  onChange={e => setEditTenant({ ...editTenant, slug: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 text-white font-mono rounded px-3 py-2 focus:outline-none focus:border-[#00ff41] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">STATUS</label>
                <select
                  value={editTenant.status}
                  onChange={e => setEditTenant({ ...editTenant, status: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 text-white font-mono rounded px-3 py-2 focus:outline-none focus:border-[#00ff41] text-sm"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-[#00ff41] text-black font-mono font-bold py-2 rounded hover:bg-[#00cc34] disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setEditTenant(null)} className="flex-1 border border-gray-700 text-gray-400 font-mono py-2 rounded">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-red-500/40 rounded-xl p-8 w-full max-w-sm text-center">
            <p className="font-mono text-red-400 mb-2 text-lg font-bold">CONFIRM DELETE</p>
            <p className="text-gray-400 font-mono text-sm mb-6">This will permanently delete the agency and ALL their data. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={loading} className="flex-1 bg-red-600 text-white font-mono font-bold py-2 rounded hover:bg-red-500 disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-700 text-gray-400 font-mono py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}