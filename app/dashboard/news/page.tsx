'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
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
    <div className="flex items-center justify-center py-20">
      <p className="text-neon-green font-mono animate-pulse text-glow">Loading intel...</p>
    </div>
  )

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-mono font-bold text-neon-green tracking-wider text-glow mb-2">NEWS HQ</h1>
          <p className="text-gray-400 font-mono text-sm">Disseminate updates to your tenant network.</p>
        </div>
        <button onClick={openCreate}
          className="bg-neon-green/90 text-black font-mono font-bold px-6 py-3 rounded-lg hover:bg-neon-green hover:shadow-[0_0_15px_rgba(0,255,65,0.4)] transition-all duration-300 uppercase tracking-widest text-sm">
          + TRANSMIT NEWS
        </button>
      </div>

      <div className="space-y-6">
        {news.map(item => (
          <div key={item.id} className="glass-panel group rounded-2xl flex flex-col sm:flex-row overflow-hidden hover:border-neon-green/40 transition-all duration-300">
            {item.images[0] ? (
              <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden border-r border-white/5">
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={false}
                />
              </div>
            ) : (
              <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-black/60 border-r border-white/5 flex items-center justify-center text-gray-500 font-mono text-xs tracking-widest uppercase">
                NO COVER
              </div>
            )}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-mono text-white text-lg font-bold group-hover:text-neon-green transition-colors">{item.title}</h3>
                <p className="font-mono text-sm text-gray-400 mt-2 line-clamp-2">{item.body}</p>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-mono uppercase tracking-widest ${item.published ? 'text-neon-green' : 'text-gray-500'}`}>
                    {item.published ? '● BROADCASTED' : '○ DRAFT'}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => openEdit(item)} className="text-xs font-mono text-gray-400 hover:text-white transition-colors tracking-widest uppercase">EDIT</button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs font-mono text-red-500 hover:text-red-400 transition-colors tracking-widest uppercase">DEL</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!news.length && <p className="text-center font-mono text-gray-400 py-12 border border-dashed border-white/10 rounded-2xl">NO TRANSMISSIONS DETECTED.</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up border border-neon-green/20">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-10">
              <h2 className="text-xl font-mono font-bold text-neon-green uppercase tracking-widest">{modal === 'create' ? 'INIT TRANSMISSION' : 'ALTER TRANSMISSION'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white transition-colors">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Headline *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Payload (Content)</label>
                <textarea rows={8} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all resize-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Transmission Cover</label>
                <div {...getRootProps()} className="border-2 border-dashed border-white/20 bg-black/20 rounded-xl p-8 text-center cursor-pointer hover:border-neon-green/50 hover:bg-neon-green/5 transition-all group">
                  <input {...getInputProps()} />
                  {uploading ? <p className="font-mono text-neon-green animate-pulse">UPLOADING DATA…</p>
                    : form.coverImage
                    ? <div className="relative h-48 w-full rounded-lg overflow-hidden border border-white/10">
                        <Image
                            src={form.coverImage}
                            alt=""
                            fill
                            className="object-cover"
                            priority={false}
                        />
                      </div>
                    : <div className="space-y-2">
                        <p className="font-mono text-sm text-gray-400 group-hover:text-neon-green transition-colors">DRAG IMAGE HERE OR CLICK</p>
                    </div>}
                </div>
              </div>
              <div className="flex items-center gap-4 py-4 border-t border-white/10">
                <div className="relative flex items-center">
                  <input type="checkbox" id="published_news" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="peer sr-only" />
                  <div className="w-11 h-6 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-neon-green after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </div>
                 <label htmlFor="published_news" className="font-mono text-sm text-gray-300 font-bold uppercase tracking-widest cursor-pointer">MAKE PUBLIC (PUBLISH)</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-neon-green/90 text-black font-mono font-bold py-3.5 rounded-lg hover:bg-neon-green hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] disabled:opacity-50 transition-all uppercase tracking-widest">
                  {saving ? 'PROCESSING…' : 'DISPATCH'}
                </button>
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 border border-gray-600 text-gray-400 font-mono py-3.5 rounded-lg hover:text-white hover:border-gray-400 transition-all uppercase tracking-widest">
                  ABORT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}