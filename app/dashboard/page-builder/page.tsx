'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'

type Profile = {
  logo_url?: string | null
  cover_url?: string | null
  bio?: string | null
  tagline?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  contactAddress?: string | null
  social_links?: {
    instagram?: string
    x?: string
    linkedin?: string
    whatsapp?: string
  } | null
}

type Tenant = {
  name?: string
  slug?: string
  primary_color?: string | null
}

async function getToken() {
  return auth.currentUser?.getIdToken() ?? null
}

const PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#dc2626',
  '#d97706', '#16a34a', '#0891b2', '#00ff41',
]

export default function PageBuilderPage() {
  const [profile, setProfile] = useState<Profile>({})
  const [tenant, setTenant] = useState<Tenant>({})
  const [primaryColor, setPrimaryColor] = useState('#2563eb')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'branding' | 'content' | 'contact' | 'social'>('branding')

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      if (!token) return
      const res = await fetch('/api/dashboard/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile ?? {})
        setTenant(data.tenant ?? {})
        setPrimaryColor(data.tenant?.primary_color ?? '#2563eb')
      }
      setLoading(false)
    }
    load()
  }, [])

  const save = async () => {
    const token = await getToken()
    if (!token) return
    setSaving(true)
    await fetch('/api/dashboard/profile', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile,
        tenant: { primary_color: primaryColor },
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateProfile = (key: keyof Profile, value: string) => {
    setProfile(p => ({ ...p, [key]: value }))
  }

  const updateSocial = (key: string, value: string) => {
    setProfile(p => ({ ...p, social_links: { ...p.social_links, [key]: value } }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 font-mono animate-pulse">Loading page builder...</p>
      </div>
    )
  }

  const publicUrl = tenant.slug
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')}/${tenant.slug}`
    : null

  const [copied, setCopied] = useState(false)
  const copyLink = () => {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs = [
    { id: 'branding', label: 'Branding' },
    { id: 'content', label: 'Content' },
    { id: 'contact', label: 'Contact' },
    { id: 'social', label: 'Social' },
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white">Page Builder</h1>
          <p className="text-gray-400 text-sm mt-1">Customize your public agency page</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg font-mono text-sm font-bold text-black transition-all disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Public URL Banner */}
      {publicUrl && (
        <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Your Public Agency URL</p>
            <p className="font-mono text-sm text-white truncate">{publicUrl}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={copyLink}
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold border transition-all"
              style={{
                borderColor: copied ? primaryColor : 'rgba(255,255,255,0.15)',
                color: copied ? primaryColor : '#aaa',
                background: copied ? `${primaryColor}15` : 'transparent',
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold text-black transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              Open Page ↗
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="glass-panel rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={activeTab === tab.id ? { borderColor: primaryColor } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">
            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <>
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-3">
                    Brand Color
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setPrimaryColor(c)}
                        className="w-8 h-8 rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: c,
                          borderColor: primaryColor === c ? 'white' : 'transparent',
                          transform: primaryColor === c ? 'scale(1.2)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-2 focus:outline-none focus:border-white/30 text-sm"
                      placeholder="#2563eb"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={profile.logo_url ?? ''}
                    onChange={e => updateProfile('logo_url', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-600 text-sm"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={profile.cover_url ?? ''}
                    onChange={e => updateProfile('cover_url', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-600 text-sm"
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <>
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={profile.tagline ?? ''}
                    onChange={e => updateProfile('tagline', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-600 text-sm"
                    placeholder="Your trusted real estate partner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                    Bio / About
                  </label>
                  <textarea
                    value={profile.bio ?? ''}
                    onChange={e => updateProfile('bio', e.target.value)}
                    rows={5}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-600 text-sm resize-none"
                    placeholder="Tell visitors about your agency..."
                  />
                </div>
              </>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <>
                {[
                  { key: 'contactEmail', label: 'Email', placeholder: 'contact@agency.com', type: 'email' },
                  { key: 'contactPhone', label: 'Phone', placeholder: '+1 555 000 0000', type: 'tel' },
                  { key: 'contactAddress', label: 'Address', placeholder: '123 Main St, City', type: 'text' },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={(profile as any)[key] ?? ''}
                      onChange={e => updateProfile(key as keyof Profile, e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-600 text-sm"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <>
                {[
                  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                  { key: 'x', label: 'X (Twitter)', placeholder: 'https://x.com/...' },
                  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
                  { key: 'whatsapp', label: 'WhatsApp', placeholder: '+1234567890' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={profile.social_links?.[key as keyof typeof profile.social_links] ?? ''}
                      onChange={e => updateSocial(key, e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-600 text-sm"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Live Preview</span>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
          </div>

          {/* Preview content */}
          <div className="overflow-y-auto max-h-[600px] bg-white text-gray-900">
            {/* Cover */}
            <div
              className="relative h-40 flex items-end px-6 pb-4"
              style={{ backgroundColor: primaryColor }}
            >
              {profile.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.cover_url}
                  alt="cover"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
              )}
              <div className="relative z-10 flex items-end gap-4">
                {profile.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.logo_url}
                    alt="logo"
                    className="w-14 h-14 rounded-xl border-2 border-white object-cover bg-white"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-xl border-2 border-white flex items-center justify-center text-2xl font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {tenant.name?.[0] ?? 'A'}
                  </div>
                )}
                <div>
                  <h2 className="text-white font-bold text-xl leading-tight">{tenant.name ?? 'Agency Name'}</h2>
                  {profile.tagline && (
                    <p className="text-white/80 text-sm">{profile.tagline}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {profile.bio && (
                <div>
                  <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-1">About</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {(profile.contactEmail || profile.contactPhone || profile.contactAddress) && (
                <div>
                  <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">Contact</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    {profile.contactEmail && <p>✉ {profile.contactEmail}</p>}
                    {profile.contactPhone && <p>📞 {profile.contactPhone}</p>}
                    {profile.contactAddress && <p>📍 {profile.contactAddress}</p>}
                  </div>
                </div>
              )}

              {profile.social_links && Object.values(profile.social_links).some(Boolean) && (
                <div>
                  <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">Social</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(profile.social_links).map(([key, val]) =>
                      val ? (
                        <span
                          key={key}
                          className="px-3 py-1 rounded-full text-xs text-white font-medium"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {key}
                        </span>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* Placeholder listings */}
              <div>
                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">Listings</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2].map(i => (
                    <div key={i} className="rounded-lg overflow-hidden border border-gray-100">
                      <div className="h-20 bg-gray-100" />
                      <div className="p-2">
                        <div className="h-2 bg-gray-200 rounded w-3/4 mb-1" />
                        <div
                          className="h-2 rounded w-1/2"
                          style={{ backgroundColor: primaryColor, opacity: 0.3 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
