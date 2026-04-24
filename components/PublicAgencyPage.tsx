'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import { PropertyDetailModal } from './PropertyDetailModal'
import { FloatContactButtons } from './FloatContactButtons'
import { InquiryForm } from './InquiryForm'

const STATUS_LABELS: Record<string, string> = {
  available: 'متاح',
  sold: 'مباع',
  rented: 'مؤجر',
}

const STATUS_COLORS: Record<string, string> = {
  available: '#22c55e',
  sold: '#ef4444',
  rented: '#f59e0b',
}

const DAY_LABELS_AR: Record<string, string> = {
  mon: 'الإثنين', tue: 'الثلاثاء', wed: 'الأربعاء',
  thu: 'الخميس', fri: 'الجمعة', sat: 'السبت', sun: 'الأحد',
}

type Tenant = {
  id: string
  name: string
  slug: string
  primary_color: string | null
  theme?: string | null
}

type Profile = {
  logo_url?: string | null
  cover_url?: string | null
  bio?: string | null
  licence_no?: string | null
  tagline?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  contact_address?: string | null
  social_links?: {
    instagram?: string
    x?: string
    linkedin?: string
    whatsapp?: string
  } | null
  working_hours?: Record<string, { enabled: boolean; open: string; close: string }> | null
  page_sections?: {
    hero?: boolean
    featured?: boolean
    listings?: boolean
    about?: boolean
    news?: boolean
    gallery?: boolean
    team?: boolean
    footer?: boolean
  } | null
  page_config?: {
    hero_headline?: string
    featured_count?: number
    listings_columns?: 2 | 3 | 4
    show_listing_filters?: boolean
    show_listing_search?: boolean
  } | null
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

export default function PublicAgencyPage({ tenant, profile, listings, news, gallery, team }: Props) {
  const primary = tenant.primary_color ?? '#2563eb'
  const [activeListing, setActiveListing] = useState<Post | null>(null)
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [listingSearch, setListingSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const sections = {
    hero: true,
    featured: true,
    listings: true,
    about: true,
    news: true,
    gallery: false,
    team: false,
    footer: true,
    ...(profile?.page_sections ?? {}),
  }

  const pageConfig = {
    hero_headline: 'ابحث عن عقارك المثالي',
    featured_count: 6,
    listings_columns: 3 as 2 | 3 | 4,
    show_listing_filters: true,
    show_listing_search: true,
    ...(profile?.page_config ?? {}),
  }

  const whatsapp = profile?.social_links?.whatsapp
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً، وجدتك عبر موقعك ${tenant.name}`)}`
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('revealed') }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [listings, news]);



  const publishedListings = listings.filter((l) => l.published !== false)
  const featuredListings = publishedListings.slice(0, pageConfig.featured_count)
  const filteredListings = statusFilter === 'all'
    ? publishedListings
    : publishedListings.filter(l => l.listing_status === statusFilter)
  const menuListings = listingSearch.trim()
    ? filteredListings.filter((l) => `${l.title || ''} ${l.location || ''}`.toLowerCase().includes(listingSearch.toLowerCase()))
    : filteredListings

  return (
    <>
      <style>{`
        :root { --primary: ${primary}; }
        .btn-primary { background: var(--primary); }
        .text-primary { color: var(--primary); }
        .border-primary { border-color: var(--primary); }
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .revealed { opacity: 1; transform: translateY(0); }
      `}</style>

      <div className="min-h-screen bg-white text-gray-900" dir="rtl">

        {/* Sticky RTL Navbar */}
        <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile?.logo_url && (
                <Image src={profile.logo_url} alt={tenant.name} width={40} height={40}
                  className="w-10 h-10 rounded-full object-cover" priority={false} />
              )}
              <span className={`font-bold text-lg ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                {tenant.name}
              </span>
            </div>
            {whatsapp && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 btn-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
                </svg>
                واتساب
              </a>
            )}
          </div>
        </nav>

        {/* Hero */}
        {sections.hero && (<section
          className="relative h-screen flex items-end justify-center pb-20 bg-gray-900 bg-cover bg-center"
          style={profile?.cover_url ? { backgroundImage: `url(${profile.cover_url})` } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />
          <div className="relative z-10 text-center text-white px-4 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-8 py-10 shadow-2xl">
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
            <p className="text-lg text-white/80 mb-6">{pageConfig.hero_headline}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {whatsapp && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="btn-primary text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
                  </svg>
                  تواصل عبر واتساب
                </a>
              )}
              <button
                onClick={() => setShowInquiryModal(true)}
                className="bg-white/20 backdrop-blur text-white border border-white/40 px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors">
                أرسل استفساراً
              </button>
            </div>
            </div>
          </div>
        </section>)}

        {/* Featured Listings */}
        {sections.featured && featuredListings.length > 0 && (
          <section className="reveal py-16 px-4 md:px-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">العقارات المميزة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map(l => (
                <button key={l.id} onClick={() => setActiveListing(l)} className="text-right group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                  <div className="relative">
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
                      <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-gray-300 text-sm">لا توجد صورة</div>
                    )}
                    {l.listing_status && (
                      <span
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: STATUS_COLORS[l.listing_status] ?? primary }}
                      >
                        {STATUS_LABELS[l.listing_status] ?? l.listing_status}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{l.title}</h3>
                    {l.price != null && <p className="text-primary font-bold text-lg mb-1">{l.price.toLocaleString('ar-SA')} ر.س</p>}
                    {l.location && <p className="text-gray-500 text-sm mb-2">📍 {l.location}</p>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Listings menu */}
        {sections.listings && publishedListings.length > 0 && (
          <section className="reveal py-16 px-4 md:px-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">قائمة العقارات</h2>

            {pageConfig.show_listing_search && (
              <div className="mb-4">
                <input
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  placeholder="ابحث باسم العقار أو الموقع"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color' as any]: `${primary}55` }}
                />
              </div>
            )}

            {pageConfig.show_listing_filters && (
              <div className="flex flex-wrap gap-2 mb-8">
                {(['all', 'available', 'sold', 'rented'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      statusFilter === f
                        ? 'text-white border-transparent'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                    style={statusFilter === f ? { backgroundColor: primary, borderColor: primary } : {}}
                  >
                    {f === 'all' ? 'الكل' : STATUS_LABELS[f]}
                  </button>
                ))}
              </div>
            )}

            {menuListings.length === 0 ? (
              <p className="text-center text-gray-400 py-12">لا توجد عقارات لهذا التصنيف</p>
            ) : (
              <div className={`grid grid-cols-1 ${pageConfig.listings_columns === 2 ? 'sm:grid-cols-2' : pageConfig.listings_columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                {menuListings.map(l => (
                  <button key={l.id} onClick={() => setActiveListing(l)} className="text-right group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                    <div className="relative">
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
                        <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-gray-300 text-sm">لا توجد صورة</div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-900 px-4 py-1.5 rounded-full text-sm font-semibold transition-opacity">
                          عرض التفاصيل
                        </span>
                      </div>
                      {l.listing_status && (
                        <span
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: STATUS_COLORS[l.listing_status] ?? primary }}
                        >
                          {STATUS_LABELS[l.listing_status] ?? l.listing_status}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{l.title}</h3>
                      {l.price != null && <p className="text-primary font-bold text-lg mb-1">{l.price.toLocaleString('ar-SA')} ر.س</p>}
                      {l.location && <p className="text-gray-500 text-sm mb-2">📍 {l.location}</p>}
                      <div className="flex gap-3 text-xs text-gray-500">
                        {l.bedrooms != null && <span>🛏 {l.bedrooms} غرفة</span>}
                        {l.bathrooms != null && <span>🚿 {l.bathrooms} حمام</span>}
                        {l.area_sqm != null && <span>📐 {l.area_sqm} م²</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* News */}
        {sections.news && news.length > 0 && (
          <section className="reveal py-16 bg-gray-50">
            <div className="px-4 md:px-8 max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">آخر الأخبار</h2>
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
                      <p className="text-xs text-gray-400 mb-1">
                        {new Date(item.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
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
        {sections.about && (<section className="reveal py-16 px-4 md:px-8 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">من نحن</h2>
          {profile?.bio && <p className="text-gray-600 leading-relaxed text-lg">{profile.bio}</p>}
          {profile?.licence_no && (
            <p className="mt-4 text-sm text-gray-400 font-mono">رقم الترخيص: {profile.licence_no}</p>
          )}
        </section>)}

        {/* Team */}
        {sections.team && team.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="px-4 md:px-8 max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">فريقنا</h2>
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
                    <p className="text-sm text-gray-500">{member.role === 'admin' ? 'مدير' : 'وكيل عقاري'}</p>
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
        {sections.gallery && gallery.length > 0 && (
          <section className="py-16">
            <div className="px-4 md:px-8 max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">معرض الصور</h2>
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
                      alt={item.label ?? `صورة ${i + 1}`}
                      width={600}
                      height={400}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      priority={false}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-medium transition-opacity">تكبير</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        {sections.footer && (<footer className="bg-gray-900 text-white py-12 px-4 md:px-8">
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
              {profile?.bio && <p className="text-gray-400 text-sm mt-2 line-clamp-3">{profile.bio}</p>}
              {profile?.contact_address && <p className="text-gray-300 text-sm mt-4">📍 {profile.contact_address}</p>}
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">التواصل</h4>
              {whatsapp && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white block mb-2 transition-colors">
                  💬 واتساب: {whatsapp}
                </a>
              )}
              {profile?.contact_email && (
                <a href={`mailto:${profile.contact_email}`} className="text-sm text-gray-300 hover:text-white block mb-2 transition-colors">
                  ✉️ {profile.contact_email}
                </a>
              )}
              {profile?.contact_phone && (
                <a href={`tel:${profile.contact_phone}`} className="text-sm text-gray-300 hover:text-white block mb-2 transition-colors">
                  📞 {profile.contact_phone}
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
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
            {profile?.working_hours && (
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">ساعات العمل</h4>
                <div className="space-y-1">
                  {Object.entries(profile.working_hours).map(([day, h]: [string, { enabled: boolean; open: string; close: string }]) => (
                    <div key={day} className="flex justify-between text-xs text-gray-400">
                      <span>{DAY_LABELS_AR[day] ?? day}</span>
                      <span>{h.enabled ? `${h.open} – ${h.close}` : 'مغلق'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            جميع الحقوق محفوظة © {new Date().getFullYear()} {tenant.name}
          </div>
        </footer>)}

        {/* Float contact buttons (WhatsApp + Phone) */}
        <FloatContactButtons
          whatsapp={profile?.social_links?.whatsapp}
          phone={profile?.contact_phone ?? undefined}
          accentColor={primary}
        />

        {/* Property Detail Modal */}
        {activeListing && (
          <PropertyDetailModal
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            property={activeListing as any}
            onClose={() => setActiveListing(null)}
            slug={tenant.slug}
            accentColor={primary}
          />
        )}

        {/* Standalone Inquiry Modal */}
        {showInquiryModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">أرسل استفساراً</h3>
                <button onClick={() => setShowInquiryModal(false)} className="text-gray-400 hover:text-gray-300 text-xl">×</button>
              </div>
              <InquiryForm
                slug={tenant.slug}
                accentColor={primary}
                onSuccess={() => setTimeout(() => setShowInquiryModal(false), 2500)}
              />
            </div>
          </div>
        )}
      </div>
    </>

  )
}
