'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { auth } from '@/lib/firebase'
import { toast } from '@/hooks/use-toast'

type Profile = {
  tenant_id?: string
  logo_url?: string
  cover_url?: string
  bio?: string
  tagline?: string
  licenceNo?: string
  agencyName?: string
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
  socialLinks?: {
    instagram?: string
    x?: string
    linkedin?: string
    whatsapp?: string
  }
}

async function getToken() {
  return auth.currentUser?.getIdToken() ?? null
}

const InputField = ({ label, value, onChange, placeholder, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:bg-black/60 focus:ring-1 focus:ring-neon-green transition-all placeholder:text-gray-600 backdrop-blur-md"
    />
  </div>
)

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
    setSaving(true)
    const token = await getToken()
    if (!token) {
      setSaving(false)
      return
    }
    const res = await fetch('/api/dashboard/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(profile),
    })
    setSaving(false)
    if (!res.ok) {
      toast({ title: 'Save failed', description: 'Error saving profile.', variant: 'destructive' })
      return
    }
    toast({ title: 'Saved', description: 'Profile updated successfully.' })
  }

  const handleFileUpload = async (file: File, type: 'logo' | 'cover') => {
    const token = await getToken()
    if (!token) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'profiles')
    const res = await fetch('/api/dashboard/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData })
    if (!res.ok) {
      toast({ title: 'Upload failed', description: 'Unable to upload file.', variant: 'destructive' })
      return
    }
    const { url } = await res.json()
    setProfile(prev => prev ? { ...prev, [type === 'logo' ? 'logoUrl' : 'coverUrl']: url } : null)
    toast({ title: 'Uploaded', description: `${type === 'logo' ? 'Logo' : 'Cover'} updated successfully.` })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-neon-green font-mono animate-pulse text-glow">Loading profile data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-mono font-bold text-neon-green tracking-wider text-glow mb-2">AGENCY PROFILE</h1>
        <p className="text-gray-400 font-mono text-sm">Configure your white-label web presence and public identity.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Visuals */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-mono text-white mb-6 border-b border-white/10 pb-4">Branding Assets</h2>
            <div className="space-y-2">
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Cover Photo (16:9)</label>
              <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-white/10 hover:border-neon-green/50 transition-colors h-48 bg-black/40 flex items-center justify-center">
                {profile?.coverUrl || profile?.cover_url ? (
                  <Image src={profile.coverUrl || profile.cover_url!} alt="Cover" fill className="object-cover" />
                ) : (
                  <span className="text-gray-500 font-mono text-sm">16:9 Banner Image</span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-neon-green font-mono text-sm border border-neon-green px-4 py-2 rounded-lg bg-black/50 backdrop-blur cursor-pointer hover:bg-neon-green hover:text-black transition-colors">
                    Upload New
                  </span>
                </div>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')} />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Agency Logo</label>
              <div className="relative group w-32 h-32 rounded-xl overflow-hidden border-2 border-dashed border-white/10 hover:border-neon-green/50 transition-colors bg-black/40 flex items-center justify-center">
                {profile?.logoUrl || profile?.logo_url ? (
                  <Image src={profile.logoUrl || profile.logo_url!} alt="Logo" fill className="object-cover" />
                ) : (
                  <span className="text-gray-500 font-mono text-xs text-center px-2">Square Logo</span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-neon-green font-mono text-xs border border-neon-green p-2 rounded-lg bg-black/50 backdrop-blur cursor-pointer hover:bg-neon-green hover:text-black transition-colors">
                    Upload
                  </span>
                </div>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Text Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-mono text-white mb-6 border-b border-white/10 pb-4">Agency Details</h2>

          <InputField 
            label="Agency Name" 
            value={profile?.agencyName} 
            onChange={(e: any) => setProfile(prev => prev ? { ...prev, agencyName: e.target.value } : null)} 
            placeholder="Your agency name" 
          />

          <InputField 
            label="Tagline" 
            value={profile?.tagline} 
            onChange={(e: any) => setProfile(prev => prev ? { ...prev, tagline: e.target.value } : null)} 
            placeholder="One line that defines you" 
          />
          
          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Agency Bio</label>
            <textarea
              value={profile?.bio || ''}
              onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
              className="w-full h-32 bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:bg-black/60 focus:ring-1 focus:ring-neon-green transition-all placeholder:text-gray-600 backdrop-blur-md resize-none"
              placeholder="Describe your agency..."
            />
          </div>

          <InputField 
            label="Real Estate Licence Number" 
            value={profile?.licenceNo || profile?.licence_no} 
            onChange={(e: any) => setProfile(prev => prev ? { ...prev, licenceNo: e.target.value } : null)} 
            placeholder="e.g. ORN 123456" 
          />
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-mono text-white mb-6 border-b border-white/10 pb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="Contact Email" 
            value={profile?.contactEmail} 
            onChange={(e: any) => setProfile(prev => prev ? { ...prev, contactEmail: e.target.value } : null)} 
            placeholder="contact@agency.com" 
          />
          <InputField 
            label="Phone Number" 
            value={profile?.contactPhone} 
            onChange={(e: any) => setProfile(prev => prev ? { ...prev, contactPhone: e.target.value } : null)} 
            placeholder="+1 234 567 890" 
          />
          <div className="col-span-1 md:col-span-2">
             <InputField 
              label="Office Address" 
              value={profile?.contactAddress} 
              onChange={(e: any) => setProfile(prev => prev ? { ...prev, contactAddress: e.target.value } : null)} 
              placeholder="123 Main St, City" 
            />
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-mono text-white mb-6 border-b border-white/10 pb-4">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="WhatsApp Number" 
            value={profile?.socialLinks?.whatsapp || profile?.social_links?.whatsapp} 
            onChange={(e: any) => setProfile(prev => prev ? { ...prev, socialLinks: { ...prev.socialLinks, whatsapp: e.target.value } } : null)} 
            placeholder="+971 50 123 4567" 
          />
          <InputField 
            label="Instagram URL" 
            value={profile?.socialLinks?.instagram || profile?.social_links?.instagram} 
            onChange={(e: any) => setProfile(prev => prev ? { ...prev, socialLinks: { ...prev.socialLinks, instagram: e.target.value } } : null)} 
            placeholder="https://instagram.com/youragency" 
          />
          <InputField 
            label="X (Twitter) URL" 
            value={profile?.socialLinks?.x || profile?.social_links?.x} 
            onChange={(e: any) => setProfile(prev => prev ? { ...prev, socialLinks: { ...prev.socialLinks, x: e.target.value } } : null)} 
            placeholder="https://x.com/youragency" 
          />
          <InputField 
            label="LinkedIn URL" 
            value={profile?.socialLinks?.linkedin || profile?.social_links?.linkedin} 
            onChange={(e: any) => setProfile(prev => prev ? { ...prev, socialLinks: { ...prev.socialLinks, linkedin: e.target.value } } : null)} 
            placeholder="https://linkedin.com/company/youragency" 
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-neon-green/90 text-black font-mono font-bold px-8 py-3 rounded-lg hover:bg-neon-green hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 tracking-widest uppercase"
        >
          {saving ? 'UPDATING...' : 'SAVE CHANGES'}
        </button>
      </div>

    </div>
  )
}