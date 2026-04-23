'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'

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

type TeamMember = {
  id: string
  email: string
  role: 'agent' | 'admin'
  display_name?: string | null
  photo_url?: string | null
  phone?: string | null
}

interface Props {
  tenant: Tenant
  profile: Profile
  listings: Post[]
  news: Post[]
  gallery: Media[]
  team: TeamMember[]
}

const DAY_LABELS: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed',
  thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
}

export default function PublicAgencyPage({ tenant, profile, listings, news, gallery, team }: Props) {
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

  useEffect(() => {
    let lightbox = new PhotoSwipeLightbox({
      gallery: '#media-vault-gallery',
      children: 'a',
      pswpModule: () => import('photoswipe')
    });
    lightbox.init();
    return () => {
      lightbox.destroy();
      lightbox = null as any;
    };
  }, []);

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
              <Image
                src={profile.logo_url}
                alt={tenant.name}
                width={96}
                height={96}
                className="w-24 h-24 object-contain mx-auto mb-4 rounded-full bg-white p-1 shadow-lg"
                priority={true}
              />
            )}
            <h1 className="text-4xl md:text-6xl font-bold mb-3">{tenant.name}</h1>
            {profile?.tagline && <p className="text-xl md:text-2xl text-primary font-medium mb-4">{profile.tagline}</p>}
            {profile?.bio && <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-6 drop-shadow-xl">{profile.bio}</p>}
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
                    <Image
                      src={l.images[0]}
                      alt={l.title}
                      width={400}
                      height={208}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                      priority={false}
                    />
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
                    {item.images[0] && <Image
                      src={item.images[0]}
                      alt={item.title}
                      width={320}
                      height={176}
                      className="w-full h-44 object-cover"
                      priority={false}
                    />}
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

        {/* Team */}
        {team.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="px-4 md:px-8 max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Our Team</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.map(member => (
                  <div key={member.id} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.display_name || member.email}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                        priority={false}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center text-2xl">
                        {(member.display_name || member.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900">{member.display_name || member.email.split('@')[0]}</h3>
                    <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                    {member.phone && (
                      <a href={`tel:${member.phone}`} className="text-sm text-primary hover:underline mt-2 block">
                        {member.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="px-4 md:px-8 max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Gallery</h2>
              <div id="media-vault-gallery" className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {gallery.map((item, i) => (
                  <a
                    key={item.id}
                    href={item.url}
                    data-pswp-width="1920"
                    data-pswp-height="1080"
                    target="_blank"
                    rel="noreferrer"
                    className="block group relative overflow-hidden break-inside-avoid rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Image
                      src={item.url}
                      alt={item.label ?? `Gallery image ${i + 1}`}
                      width={600}
                      height={400}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      priority={false}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                       <span className="opacity-0 group-hover:opacity-100 bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-medium transition-opacity">&#x26F6; Enlarge</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              {profile?.logo_url && (
                <Image 
                  src={profile.logo_url} 
                  alt={tenant.name} 
                  width={64} 
                  height={64} 
                  className="w-16 h-16 object-contain mb-3 rounded" 
                />
              )}
              <h3 className="text-xl font-bold">{tenant.name}</h3>
              {profile?.bio && <p className="text-gray-400 text-sm mt-2">{profile.bio}</p>}
              {profile?.contactAddress && <p className="text-gray-300 text-sm mt-4">📍 {profile.contactAddress}</p>}
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">Contact</h4>
              {whatsapp && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white block mb-2 transition-colors">
                  💬 WhatsApp: {whatsapp}
                </a>
              )}
              {profile?.contactEmail && (
                <a href={`mailto:${profile.contactEmail}`} className="text-sm text-gray-300 hover:text-white block mb-2 transition-colors">
                  ✉️ {profile.contactEmail}
                </a>
              )}
              {profile?.contactPhone && (
                 <a href={`tel:${profile.contactPhone}`} className="text-sm text-gray-300 hover:text-white block mb-2 transition-colors">
                  📞 {profile.contactPhone}
                </a>
              )}
              <div className="flex gap-2 mt-4">
                {profile?.social_links?.instagram && (
                  <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h-.165zm3.77 4.53a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
                {profile?.social_links?.x && (
                  <a href={profile.social_links.x} target="_blank" rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {profile?.social_links?.linkedin && (
                  <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
                {profile?.social_links?.whatsapp && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0 20.117 20.117 0 003.553-1.093 20.068 20.068 0 005.596-4.084 12.633 12.633 0 002.091-7.175.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" clipRule="evenodd" />
                    </svg>
                  </a>
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
                  <Image
                    src={activeListing.images[carouselIdx]}
                    alt=""
                    width={512}
                    height={288}
                    className="w-full h-72 object-cover rounded-t-2xl"
                    priority={false}
                  />
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
                  <p className="text-sm text-gray-500 mt-1">We&apos;ll be in touch shortly.</p>
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
