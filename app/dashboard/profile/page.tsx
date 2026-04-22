'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'

type Profile = {
  tenant_id?: string
  logo_url?: string
  cover_url?: string
  bio?: string
  licence_no?: string
  social_links?: {
    instagram?: string
    x?: string
    linkedin?: string
    whatsapp?: string
  }
}

async function getToken() {
  return auth.currentUser?.getIdToken() ?? null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await getToken()
      if (!token) return
      const res = await fetch('/api/dashboard/profile', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setProfile(await res.json())
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    if (!profile) return
    const token = await getToken()
    if (!token) return
    const res = await fetch('/api/dashboard/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(profile),
    })
    if (!res.ok) alert('Error saving')
    else alert('Saved')
  }

  const handleFileUpload = async (file: File, type: 'logo' | 'cover') => {
    const token = await getToken()
    if (!token) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'profiles')
    const res = await fetch('/api/dashboard/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData })
    if (!res.ok) return alert('Upload error')
    const { url } = await res.json()
    setProfile(prev => prev ? { ...prev, [type === 'logo' ? 'logo_url' : 'cover_url']: url } : null)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Profile</h1>
      <div className="space-y-6">
        <div>
          <label>Logo</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')} />
          {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="w-20 h-20" />}
        </div>
        <div>
          <label>Cover Photo</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')} />
          {profile?.cover_url && <img src={profile.cover_url} alt="Cover" className="w-full h-40 object-cover" />}
        </div>
        <div>
          <label>Bio</label>
          <textarea
            value={profile?.bio || ''}
            onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
            className="w-full p-2 border"
          />
        </div>
        <div>
          <label>Licence Number</label>
          <input
            type="text"
            value={profile?.licence_no || ''}
            onChange={(e) => setProfile(prev => prev ? { ...prev, licence_no: e.target.value } : null)}
            className="w-full p-2 border"
          />
        </div>
        <div>
          <label>WhatsApp</label>
          <input
            type="text"
            value={profile?.social_links?.whatsapp || ''}
            onChange={(e) => setProfile(prev => prev ? { ...prev, social_links: { ...prev.social_links, whatsapp: e.target.value } } : null)}
            className="w-full p-2 border"
          />
        </div>
        {/* Similar for other social */}
        <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
      </div>
    </div>
  )
}