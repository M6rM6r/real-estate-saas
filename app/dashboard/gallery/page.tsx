'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useDropzone } from 'react-dropzone'

type MediaItem = {
  id: string
  url: string
  label: string | null
  sort_order: number
}

export default function GalleryPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/dashboard/media', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const json = await res.json()
    setMedia(json ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 20,
    onDrop: async (files) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUploading(true)
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      fd.append('bucket', 'media')
      const uploadRes = await fetch('/api/dashboard/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: fd,
      })
      const { urls } = await uploadRes.json()
      if (urls) {
        await Promise.all(
          urls.map((url: string) =>
            fetch('/api/dashboard/media', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
              body: JSON.stringify({ url }),
            })
          )
        )
        load()
      }
      setUploading(false)
    },
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Delete image?')) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch(`/api/dashboard/media/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    load()
  }

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOver.current === null) return
    const reordered = [...media]
    const [moved] = reordered.splice(dragItem.current, 1)
    reordered.splice(dragOver.current, 0, moved)
    const updated = reordered.map((item, i) => ({ ...item, sort_order: i }))
    setMedia(updated)
    dragItem.current = null
    dragOver.current = null

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch('/api/dashboard/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ order: updated.map(item => ({ id: item.id, sort_order: item.sort_order })) }),
    })
  }

  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        <span className="text-sm text-gray-500">{media.length} image{media.length !== 1 ? 's' : ''}</span>
      </div>

      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-sm text-gray-400">Uploading images…</p>
        ) : (
          <div>
            <p className="text-sm text-gray-600 font-medium">Drop images here or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">Up to 20 images · JPEG, PNG, WebP · max 5MB each</p>
          </div>
        )}
      </div>

      {media.length > 0 && (
        <p className="text-xs text-gray-400 mb-4">Drag images to reorder</p>
      )}

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {media.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => { dragItem.current = index }}
            onDragEnter={() => { dragOver.current = index }}
            onDragEnd={handleDragEnd}
            onDragOver={e => e.preventDefault()}
            className="relative break-inside-avoid group cursor-grab active:cursor-grabbing"
          >
            <img src={item.url} alt={item.label ?? ''} className="w-full rounded-lg object-cover" />
            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {!media.length && (
        <p className="text-center text-gray-400 py-12">No images in gallery yet.</p>
      )}
    </div>
  )
}
