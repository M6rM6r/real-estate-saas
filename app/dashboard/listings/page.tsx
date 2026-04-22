'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch(`/api/dashboard/listings?page=${p}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUploading(true)
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      fd.append('bucket', 'media')
      const res = await fetch('/api/dashboard/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: fd,
      })
      const json = await res.json()
      if (json.urls) setForm(prev => ({ ...prev, images: [...prev.images, ...json.urls] }))
      setUploading(false)
    },
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(payload),
      })
    } else if (editing) {
      await fetch(`/api/dashboard/listings/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch(`/api/dashboard/listings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    load(page)
  }

  const statusColor = (s: string | null) => {
    if (s === 'available') return 'bg-green-100 text-green-700'
    if (s === 'sold') return 'bg-red-100 text-red-700'
    if (s === 'rented') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-500'
  }

  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Listing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(l => (
          <div key={l.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {l.images[0] ? (
              <img src={l.images[0]} alt={l.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No image</div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">{l.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 shrink-0 ${statusColor(l.listing_status)}`}>
                  {l.listing_status ?? 'draft'}
                </span>
              </div>
              {l.price && <p className="text-blue-600 font-bold text-sm mb-1">AED {l.price.toLocaleString()}</p>}
              {l.location && <p className="text-gray-500 text-xs mb-2">{l.location}</p>}
              <div className="flex gap-3 text-xs text-gray-500 mb-3">
                {l.bedrooms != null && <span>{l.bedrooms} bed</span>}
                {l.bathrooms != null && <span>{l.bathrooms} bath</span>}
                {l.area_sqm && <span>{l.area_sqm} m²</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full ${l.published ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                  {l.published ? 'Published' : 'Draft'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(l)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(l.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
          <span className="px-3 py-1 text-sm text-gray-500">{page}/{totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">{modal === 'create' ? 'Create Listing' : 'Edit Listing'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={4} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (AED)</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input type="number" min="0" value={form.bedrooms} onChange={e => setForm(p => ({ ...p, bedrooms: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input type="number" min="0" value={form.bathrooms} onChange={e => setForm(p => ({ ...p, bathrooms: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area (m²)</label>
                  <input type="number" value={form.area_sqm} onChange={e => setForm(p => ({ ...p, area_sqm: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.listing_status} onChange={e => setForm(p => ({ ...p, listing_status: e.target.value as typeof form.listing_status }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              </div>
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors">
                  <input {...getInputProps()} />
                  {uploading ? (
                    <p className="text-sm text-gray-400">Uploading…</p>
                  ) : (
                    <p className="text-sm text-gray-500">Drag images here or click to upload (JPEG, PNG, WebP · max 5MB each)</p>
                  )}
                </div>
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt="" className="w-20 h-20 object-cover rounded" />
                        <button type="button" onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="published" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
                  className="rounded" />
                <label htmlFor="published" className="text-sm text-gray-700">Publish listing</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Listing'}
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