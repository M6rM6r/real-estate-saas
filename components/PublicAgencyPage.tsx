'use client'

import { useState } from 'react'

type Tenant = {
  id: string
  name: string
  slug: string
  primary_color: string | null
}

type Profile = {
  logo_url?: string | null
  cover_url?: string | null
  bio?: string | null
  licence_no?: string | null
  social_links?: {
    instagram?: string
    x?: string
    linkedin?: string
    whatsapp?: string
  } | null
  working_hours?: Record<string, { enabled: boolean; open: string; close: string }> | null
} | null

type Post = {
  id: string
  title: string
  body: string | null
  images: string[]
  price: number | null
  location: string | null
  bedrooms: number | null
  bathrooms: number | null
  area_sqm: number | null
  listing_status: string | null
  published: boolean
  created_at: string
}

type Media = {
  id: string
  url: string
  label: string | null
  sort_order: number
}

interface Props {
  tenant: Tenant
  profile: Profile
  listings: Post[]
  news: Post[]
  gallery: Media[]
}

const DAY_LABELS: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed',
  thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
}

export default function PublicAgencyPage({ tenant, profile, listings, news, gallery }: Props) {
  const primary = tenant.primary_color ?? '#2563eb'
  const [activeListing, setActiveListing] = useState<Post | null>(null)
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [leadSent, setLeadSent] = useState(false)
  const [leadLoading, setLeadLoading] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)

  const whatsapp = profile?.social_links?.whatsapp
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${tenant.name}, I found you via your website.`)}`
    : '#'

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLeadLoading(true)
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...leadForm, tenant_id: tenant.id, listing_id: activeListing?.id ?? null }),
    })
    setLeadSent(true)
    setLeadLoading(false)
  }

  const openListing = (l: Post) => {
    setActiveListing(l)
    setCarouselIdx(0)
  }

  return (
    <>
      <style>{`
        :root { --primary: ${primary}; }
        .btn-primary { background: var(--primary); }
        .text-primary { color: var(--primary); }
        .border-primary { border-color: var(--primary); }
      `}</style>

      <div className="min-h-screen bg-white text-gray-900">

        {/* Hero */}
        <section
          className="relative h-screen flex items-end justify-center pb-20 bg-gray-900 bg-cover bg-center"
          style={profile?.cover_url ? { backgroundImage: `url(${profile.cover_url})` } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />
          <div className="relative z-10 text-center text-white px-4">
            {profile?.logo_url && (
              <img src={profile.logo_url} alt={tenant.name} className="w-24 h-24 object-contain mx-auto mb-4 rounded-full bg-white p-1 shadow-lg" />
            )}
            <h1 className="text-4xl md:text-6xl font-bold mb-3">{tenant.name}</h1>
            {profile?.bio && <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-6">{profile.bio}</p>}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {whatsapp && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="btn-primary text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
                  </svg>
                  WhatsApp Us
                </a>
              )}
              <button
                onClick={() => setShowLeadModal(true)}
                className="bg-white/20 backdrop-blur text-white border border-white/40 px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors">
                Get in Touch
              </button>
            </div>
          </div>
        </section>

        {/* Listings */}
        {listings.length > 0 && (
          <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(l => (
                <button key={l.id} onClick={() => openListing(l)} className="text-left group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                  {l.images[0] ? (
                    <img src={l.images[0]} alt={l.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-gray-300 text-sm">No image</div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{l.title}</h3>
                    {l.price && <p className="text-primary font-bold text-lg mb-1">AED {l.price.toLocaleString()}</p>}
                    {l.location && <p className="text-gray-500 text-sm mb-2">{l.location}</p>}
                    <div className="flex gap-3 text-xs text-gray-500">
                      {l.bedrooms != null && <span>{l.bedrooms} bed</span>}
                      {l.bathrooms != null && <span>{l.bathrooms} bath</span>}
                      {l.area_sqm && <span>{l.area_sqm} m²</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* News */}
        {news.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="px-4 md:px-8 max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Latest News</h2>
              <div className="flex gap-6 overflow-x-auto pb-4">
                {news.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm shrink-0 w-80">
                    {item.images[0] && <img src={item.images[0]} alt={item.title} className="w-full h-44 object-cover" />}
                    <div className="p-5">
                      <p className="text-xs text-gray-400 mb-1">{new Date(item.created_at).toLocaleDateString()}</p>
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      {item.body && <p className="text-sm text-gray-500 line-clamp-3">{item.body}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About */}
        <section className="py-16 px-4 md:px-8 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">About {tenant.name}</h2>
          {profile?.bio && <p className="text-gray-600 leading-relaxed text-lg">{profile.bio}</p>}
          {profile?.licence_no && (
            <p className="mt-4 text-sm text-gray-400 font-mono">Licence: {profile.licence_no}</p>
          )}
        </section>

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="px-4 md:px-8 max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Gallery</h2>
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {gallery.map(item => (
                  <img key={item.id} src={item.url} alt={item.label ?? ''} className="break-inside-avoid w-full rounded-xl object-cover" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              {profile?.logo_url && <img src={profile.logo_url} alt={tenant.name} className="w-16 h-16 object-contain mb-3 rounded" />}
              <h3 className="text-xl font-bold">{tenant.name}</h3>
              {profile?.bio && <p className="text-gray-400 text-sm mt-2">{profile.bio}</p>}
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">Contact</h4>
              {whatsapp && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white block mb-1">
                  WhatsApp: {whatsapp}
                </a>
              )}
              <div className="flex gap-3 mt-3">
                {profile?.social_links?.instagram && (
                  <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">Instagram</a>
                )}
                {profile?.social_links?.x && (
                  <a href={profile.social_links.x} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">X</a>
                )}
                {profile?.social_links?.linkedin && (
                  <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">LinkedIn</a>
                )}
              </div>
            </div>
            {profile?.working_hours && (
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">Hours</h4>
                <div className="space-y-1">
                  {Object.entries(profile.working_hours).map(([day, h]: [string, { enabled: boolean; open: string; close: string }]) => (
                    <div key={day} className="flex justify-between text-xs text-gray-400">
                      <span>{DAY_LABELS[day] ?? day}</span>
                      <span>{h.enabled ? `${h.open} – ${h.close}` : 'Closed'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </footer>

        {/* WhatsApp FAB */}
        {whatsapp && (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="fixed bottom-6 right-6 btn-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
            </svg>
          </a>
        )}

        {/* Listing Modal */}
        {activeListing && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {activeListing.images.length > 0 && (
                <div className="relative">
                  <img src={activeListing.images[carouselIdx]} alt="" className="w-full h-72 object-cover rounded-t-2xl" />
                  {activeListing.images.length > 1 && (
                    <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                      {activeListing.images.map((_, i) => (
                        <button key={i} onClick={() => setCarouselIdx(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === carouselIdx ? 'bg-white' : 'bg-white/50'}`} />
                      ))}
                    </div>
                  )}
                  {activeListing.images.length > 1 && (
                    <>
                      <button onClick={() => setCarouselIdx(i => (i - 1 + activeListing.images.length) % activeListing.images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70">‹</button>
                      <button onClick={() => setCarouselIdx(i => (i + 1) % activeListing.images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70">›</button>
                    </>
                  )}
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{activeListing.title}</h3>
                  <button onClick={() => setActiveListing(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4">×</button>
                </div>
                {activeListing.price && <p className="text-primary text-2xl font-bold mb-2">AED {activeListing.price.toLocaleString()}</p>}
                {activeListing.location && <p className="text-gray-500 mb-3">{activeListing.location}</p>}
                <div className="flex gap-4 text-sm text-gray-600 mb-4">
                  {activeListing.bedrooms != null && <span className="flex items-center gap-1">🛏 {activeListing.bedrooms} Beds</span>}
                  {activeListing.bathrooms != null && <span className="flex items-center gap-1">🚿 {activeListing.bathrooms} Baths</span>}
                  {activeListing.area_sqm && <span className="flex items-center gap-1">📐 {activeListing.area_sqm} m²</span>}
                </div>
                {activeListing.body && <p className="text-gray-600 text-sm leading-relaxed mb-4">{activeListing.body}</p>}
                <button
                  onClick={() => { setShowLeadModal(true); setActiveListing(null) }}
                  className="w-full btn-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                  Enquire About This Property
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lead Modal */}
        {showLeadModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Get in Touch</h3>
                <button onClick={() => { setShowLeadModal(false); setLeadSent(false) }} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              {leadSent ? (
                <div className="text-center py-8">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="font-semibold text-gray-900">Message sent!</p>
                  <p className="text-sm text-gray-500 mt-1">We'll be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  <input required placeholder="Your name" value={leadForm.name} onChange={e => setLeadForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <input required placeholder="Phone number" value={leadForm.phone} onChange={e => setLeadForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <input type="email" placeholder="Email (optional)" value={leadForm.email} onChange={e => setLeadForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <textarea placeholder="Message (optional)" rows={3} value={leadForm.message} onChange={e => setLeadForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <button type="submit" disabled={leadLoading}
                    className="w-full btn-primary text-white py-2.5 rounded-xl font-semibold disabled:opacity-50">
                    {leadLoading ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
