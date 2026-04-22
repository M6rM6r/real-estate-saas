'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useDropzone } from 'react-dropzone'

type Post = {
  id: string
  title: string
  body: string | null
  images: string[]
  published: boolean
  created_at: string
}

const EMPTY_FORM = {
  title: '',
  body: '',
  coverImage: '' as string,
  published: false,
}

export default function NewsPage() {
  const [news, setNews] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/dashboard/news', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const json = await res.json()
    setNews(json.data ?? json ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setForm({ ...EMPTY_FORM })
    setModal('create')
  }

  const openEdit = (p: Post) => {
    setEditing(p)
    setForm({ title: p.title, body: p.body ?? '', coverImage: p.images[0] ?? '', published: p.published })
    setModal('edit')
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: async (files) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUploading(true)
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      fd.append('bucket', 'covers')
      const res = await fetch('/api/dashboard/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: fd,
      })
      const json = await res.json()
      if (json.urls?.[0]) setForm(p => ({ ...p, coverImage: json.urls[0] }))
      setUploading(false)
    },
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setSaving(true)

    const payload = {
      type: 'news',
      title: form.title,
      body: form.body,
      images: form.coverImage ? [form.coverImage] : [],
      published: form.published,
      published_at: form.published ? new Date().toISOString() : null,
    }

    if (modal === 'create') {
      await fetch('/api/dashboard/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(payload),
      })
    } else if (editing) {
      await fetch(`/api/dashboard/news/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(payload),
      })
    }
    setSaving(false)
    setModal(null)
    setEditing(null)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch(`/api/dashboard/news/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    load()
  }

  if (loading) return (
    <div className="p-8 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">News</h1>
        <button onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + New Article
        </button>
      </div>

      <div className="space-y-4">
        {news.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl flex overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {item.images[0] ? (
              <img src={item.images[0]} alt={item.title} className="w-40 h-28 object-cover shrink-0" />
            ) : (
              <div className="w-40 h-28 bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 text-xs">No cover</div>
            )}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.body}</p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {item.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(item)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!news.length && <p className="text-center text-gray-400 py-12">No articles yet.</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">{modal === 'create' ? 'New Article' : 'Edit Article'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea rows={6} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors">
                  <input {...getInputProps()} />
                  {uploading ? <p className="text-sm text-gray-400">Uploading…</p>
                    : form.coverImage
                    ? <img src={form.coverImage} alt="" className="w-full h-32 object-cover rounded" />
                    : <p className="text-sm text-gray-500">Click or drag to upload cover image</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="published_news" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="rounded" />
                <label htmlFor="published_news" className="text-sm text-gray-700">Publish article</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Article'}
                </button>
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}