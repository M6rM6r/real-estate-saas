'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
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
    <div className="flex items-center justify-center py-20">
      <p className="text-neon-green font-mono animate-pulse text-glow">Loading media vault...</p>
    </div>
  )

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-mono font-bold text-neon-green tracking-wider text-glow mb-2">MEDIA VAULT</h1>
          <p className="text-gray-400 font-mono text-sm">Centralized repository for digital assets.</p>
        </div>
        <span className="bg-black/60 border border-white/5 px-4 py-2 rounded-lg text-neon-green font-mono text-sm uppercase tracking-widest shadow-[0_0_10px_rgba(0,255,65,0.1)]">
            {media.length} OBJECT{media.length !== 1 ? 'S' : ''}
        </span>
      </div>

      <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group ${isDragActive ? 'border-neon-green bg-neon-green/5' : 'border-white/10 bg-black/40 hover:border-neon-green/50 hover:bg-black/60'}`}>
        <input {...getInputProps()} />
        {uploading ? (
          <p className="font-mono text-neon-green animate-pulse">UPLOADING DATA PACKETS…</p>
        ) : (
          <div className="space-y-4">
            <p className="font-mono text-lg text-gray-400 group-hover:text-neon-green transition-colors uppercase tracking-widest">DRAG ASSETS HERE OR INITIALIZE BROWSER</p>
            <p className="font-mono text-xs text-gray-600 block uppercase tracking-widest">Capacity: 20 per stream · WebP, JPEG, PNG</p>
          </div>
        )}
      </div>

      {media.length > 0 && (
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">Drag to synchronize order</p>
      )}

      <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 mt-6">
        {media.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => { dragItem.current = index }}
            onDragEnter={() => { dragOver.current = index }}
            onDragEnd={handleDragEnd}
            onDragOver={e => e.preventDefault()}
            className="relative break-inside-avoid group cursor-grab active:cursor-grabbing rounded-xl overflow-hidden glass-panel border-white/5 hover:border-neon-green/50 transition-colors"
          >
            <div className="relative w-full before:content-[''] before:block before:pt-[75%]">
                <Image
                src={item.url}
                alt={item.label ?? ''}
                fill
                className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                priority={false}
                />
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-3 right-3 bg-red-500/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all hover:bg-red-500 shadow-lg"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {!media.length && (
        <div className="border border-dashed border-white/10 rounded-2xl py-20 flex flex-col items-center justify-center bg-black/20">
            <p className="text-gray-500 font-mono uppercase tracking-widest">VAULT IS EMPTY</p>
        </div>
      )}
    </div>
  )
}'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
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
      headers: { Authorization: Bearer  },
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
        headers: { Authorization: Bearer  },
        body: fd,
      })
      const { urls } = await uploadRes.json()
      if (urls) {
        await Promise.all(
          urls.map((url: string) =>
            fetch('/api/dashboard/media', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: Bearer  },
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
      headers: { 'Content-Type': 'application/json', Authorization: Bearer  },
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

      <div {...getRootProps()} className={order-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer transition-colors }>
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
            <Image
              src={item.url}
              alt={item.label ?? ''}
              width={300}
              height={200}
              className="w-full rounded-lg object-cover"
              priority={false}
            />
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
