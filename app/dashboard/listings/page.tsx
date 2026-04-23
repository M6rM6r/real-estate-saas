'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { authHeaders } from '@/lib/firebase-client-auth'
import { useDropzone } from 'react-dropzone'

type Post = {
  id: string
  title: string
  body: string | null
  price: number | null
  location: string | null
  bedrooms: number | null
  bathrooms: number | null
  area_sqm: number | null
  listing_status: 'available' | 'sold' | 'rented' | null
  published: boolean
  images: string[]
  created_at: string
}

type FormState = {
  title: string
  body: string
  price: string
  location: string
  bedrooms: string
  bathrooms: string
  area_sqm: string
  listing_status: 'available' | 'sold' | 'rented'
  published: boolean
  images: string[]
}

const EMPTY_FORM: FormState = {
  title: '',
  body: '',
  price: '',
  location: '',
  bedrooms: '',
  bathrooms: '',
  area_sqm: '',
  listing_status: 'available',
  published: false,
  images: [],
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const PAGE_SIZE = 12

  const load = useCallback(async (p = 1) => {
    const hdrs = await authHeaders()
    if (!hdrs) return
    const res = await fetch(`/api/dashboard/listings?page=${p}`, {
      headers: hdrs,
    })
    const json = await res.json()
    setListings(json.data ?? [])
    setTotal(json.count ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => { load(page) }, [page, load])

  const openCreate = () => {
    setForm({ ...EMPTY_FORM })
    setModal('create')
  }

  const openEdit = (l: Post) => {
    setEditing(l)
    setForm({
      title: l.title,
      body: l.body ?? '',
      price: l.price?.toString() ?? '',
      location: l.location ?? '',
      bedrooms: l.bedrooms?.toString() ?? '',
      bathrooms: l.bathrooms?.toString() ?? '',
      area_sqm: l.area_sqm?.toString() ?? '',
      listing_status: l.listing_status ?? 'available',
      published: l.published,
      images: l.images ?? [],
    })
    setModal('edit')
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 10,
    onDrop: async (files) => {
      const hdrs = await authHeaders()
      if (!hdrs) return
      setUploading(true)
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      fd.append('bucket', 'media')
      const res = await fetch('/api/dashboard/upload', {
        method: 'POST',
        headers: hdrs,
        body: fd,
      })
      const json = await res.json()
      if (json.urls) setForm(prev => ({ ...prev, images: [...prev.images, ...json.urls] }))
      setUploading(false)
    },
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const hdrs = await authHeaders()
    if (!hdrs) return
    setSaving(true)

    const payload = {
      type: 'listing',
      title: form.title,
      body: form.body,
      price: form.price ? Number(form.price) : null,
      location: form.location || null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
      listing_status: form.listing_status,
      published: form.published,
      published_at: form.published ? new Date().toISOString() : null,
      images: form.images,
    }

    if (modal === 'create') {
      await fetch('/api/dashboard/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...hdrs },
        body: JSON.stringify(payload),
      })
    } else if (editing) {
      await fetch(`/api/dashboard/listings/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...hdrs },
        body: JSON.stringify(payload),
      })
    }

    setSaving(false)
    setModal(null)
    setEditing(null)
    load(page)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing?')) return
    const hdrs = await authHeaders()
    if (!hdrs) return
    await fetch(`/api/dashboard/listings/${id}`, {
      method: 'DELETE',
      headers: hdrs,
    })
    load(page)
  }

  const statusColor = (s: string | null) => {
    if (s === 'available') return 'bg-neon-green/10 text-neon-green border-neon-green/30'
    if (s === 'sold') return 'bg-red-500/10 text-red-500 border-red-500/30'
    if (s === 'rented') return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    return 'bg-gray-800 text-gray-400 border-gray-600'
  }

  if (loading) return (
    <div className="p-8">
      <div className="flex items-center justify-center py-20">
        <p className="text-neon-green font-mono animate-pulse text-glow">Loading listings...</p>
      </div>
    </div>
  )

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-mono font-bold text-neon-green tracking-wider text-glow mb-2">PROPERTY LISTINGS</h1>
          <p className="text-gray-400 font-mono text-sm">Manage your interactive portfolio.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-neon-green/90 text-black font-mono font-bold px-6 py-3 rounded-lg hover:bg-neon-green hover:shadow-[0_0_15px_rgba(0,255,65,0.4)] transition-all duration-300 uppercase tracking-widest text-sm"
        >
          + NEW LISTING
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {listings.map(l => (
          <div key={l.id} className="glass-panel group rounded-2xl overflow-hidden hover:border-neon-green/40 transition-all duration-300">
            <div className="relative w-full h-[240px] overflow-hidden">
                {l.images[0] ? (
                <Image
                    src={l.images[0]}
                    alt={l.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority={false}
                />
                ) : (
                <div className="w-full h-full bg-black/60 flex items-center justify-center text-gray-500 font-mono text-xs uppercase tracking-widest border-b border-white/5">NO MEDIA</div>
                )}
                {/* Overlay Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold border backdrop-blur-md ${statusColor(l.listing_status)}`}>
                    {l.listing_status ?? 'DRAFT'}
                  </span>
                </div>
                {/* Overlay Price */}
                {l.price && (
                  <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/90 to-transparent w-full p-4 pt-12">
                    <p className="text-neon-green font-mono font-bold text-lg tracking-wider text-glow">AED {l.price.toLocaleString()}</p>
                  </div>
                )}
            </div>
            
            <div className="p-6">
              <h3 className="font-mono text-white text-lg font-bold mb-2 truncate group-hover:text-neon-green transition-colors">{l.title}</h3>
              {l.location && <p className="text-gray-400 font-mono text-xs mb-4 truncate">{l.location}</p>}
              
              <div className="flex items-center gap-4 text-xs font-mono text-gray-500 mb-6 border-y border-white/5 py-4">
                {l.bedrooms != null && <span className="flex flex-col"><strong className="text-white text-sm">{l.bedrooms}</strong>BEDS</span>}
                {l.bathrooms != null && <span className="flex flex-col"><strong className="text-white text-sm">{l.bathrooms}</strong>BATHS</span>}
                {l.area_sqm && <span className="flex flex-col"><strong className="text-white text-sm">{l.area_sqm}</strong>SQM</span>}
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono uppercase tracking-widest ${l.published ? 'text-neon-green' : 'text-gray-500'}`}>
                  {l.published ? '● LIVE' : '○ DRAFT'}
                </span>
                <div className="flex items-center gap-3">
                  <button onClick={() => openEdit(l)} className="text-xs font-mono text-gray-400 hover:text-white transition-colors tracking-widest uppercase">EDIT</button>
                  <button onClick={() => handleDelete(l.id)} className="text-xs font-mono text-red-500 hover:text-red-400 transition-colors tracking-widest uppercase">DEL</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 font-mono">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-neon-green hover:bg-neon-green/10 disabled:opacity-30 disabled:hover:border-white/10 transition-all uppercase tracking-widest">PREV</button>
          <span className="text-sm text-neon-green font-bold flex items-center gap-2 text-glow">
             <span className="w-8 h-8 flex items-center justify-center bg-neon-green/20 rounded-lg border border-neon-green/50">{page}</span> / <span className="text-gray-500">{totalPages}</span>
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="px-4 py-2 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-neon-green hover:bg-neon-green/10 disabled:opacity-30 disabled:hover:border-white/10 transition-all uppercase tracking-widest">NEXT</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in-up border border-neon-green/20">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-10">
              <h2 className="text-xl font-mono font-bold text-neon-green uppercase tracking-widest">
                {modal === 'create' ? 'DECODE: NEW PROPERTY' : 'DECODE: EDIT PROPERTY'}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Listing Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Property Genesis Data (Description)</label>
                <textarea rows={6} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Price (AED)</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Sector Location</label>
                  <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Bedrooms</label>
                  <input type="number" min="0" value={form.bedrooms} onChange={e => setForm(p => ({ ...p, bedrooms: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Bathrooms</label>
                  <input type="number" min="0" value={form.bathrooms} onChange={e => setForm(p => ({ ...p, bathrooms: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Area (SQM)</label>
                  <input type="number" value={form.area_sqm} onChange={e => setForm(p => ({ ...p, area_sqm: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Market Status</label>
                  <select value={form.listing_status} onChange={e => setForm(p => ({ ...p, listing_status: e.target.value as typeof form.listing_status }))}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all appearance-none">
                    <option value="available" className="bg-black">Available</option>
                    <option value="sold" className="bg-black">Sold</option>
                    <option value="rented" className="bg-black">Rented</option>
                  </select>
                </div>
              </div>
              
              {/* Image upload */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Digital Twin Assets (Images)</label>
                <div {...getRootProps()} className="border-2 border-dashed border-white/20 bg-black/20 rounded-xl p-8 text-center cursor-pointer hover:border-neon-green/50 hover:bg-neon-green/5 transition-all group">
                  <input {...getInputProps()} />
                  {uploading ? (
                    <p className="font-mono text-neon-green animate-pulse">UPLOADING DATA PACKETS…</p>
                  ) : (
                    <div className="space-y-2">
                        <p className="font-mono text-sm text-gray-400 group-hover:text-neon-green transition-colors">DRAG VISUAL ASSETS HERE OR CLICK</p>
                        <p className="font-mono text-[10px] text-gray-600 block uppercase">Max 10 files · WebP, JPEG, PNG</p>
                    </div>
                  )}
                </div>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 pt-4">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden h-24 border border-white/10">
                        <Image
                          src={url}
                          alt=""
                          fill
                          className="object-cover"
                          priority={false}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                              className="bg-red-500/80 text-white rounded-full w-8 h-8 text-lg flex items-center justify-center hover:bg-red-500 transform scale-0 group-hover:scale-100 transition-transform">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 py-4 border-t border-white/10">
                <div className="relative flex items-center">
                  <input type="checkbox" id="published" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
                    className="peer sr-only" />
                  <div className="w-11 h-6 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-neon-green after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </div>
                <label htmlFor="published" className="font-mono text-sm text-gray-300 font-bold uppercase tracking-widest cursor-pointer">BROADCAST TO MAINNET (PUBLISH)</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-neon-green/90 text-black font-mono font-bold py-3.5 rounded-lg hover:bg-neon-green hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] disabled:opacity-50 transition-all uppercase tracking-widest">
                  {saving ? 'PROCESSING…' : 'COMMIT REGISTRY'}
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