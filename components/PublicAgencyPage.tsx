'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { PAGE_THEMES } from '@/lib/types'
import { PropertyDetailModal } from './PropertyDetailModal'
import { FloatContactButtons } from './FloatContactButtons'

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
  extra_phones?: string[] | null
  contact_address?: string | null
  social_links?: {
    instagram?: string
    x?: string
    linkedin?: string
    whatsapp?: string
    snapchat?: string
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
    hero_style?: 'centered' | 'split' | 'minimal'
    hero_cta_text?: string
    button_shape?: 'pill' | 'soft' | 'sharp'
    seo_title?: string
    seo_description?: string
    announcement_text?: string
    announcement_color?: 'accent' | 'yellow' | 'green'
  } | null
} | null

type Post = {
  id: string
  title: string
  body: string | null
  image_url?: string | null
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
  const pageTheme = PAGE_THEMES[(tenant.theme as keyof typeof PAGE_THEMES) ?? 'modern'] ?? PAGE_THEMES.modern
  const isDarkTheme = pageTheme.dark
  const [activeListing, setActiveListing] = useState<Post | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [listingSearch, setListingSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const surfaceCardClass = isDarkTheme ? 'text-white' : 'text-gray-900'
  const bodyTextClass = isDarkTheme ? 'text-slate-300' : 'text-gray-600'
  const mutedTextClass = isDarkTheme ? 'text-slate-400' : 'text-gray-500'
  const navTextClass = scrolled ? (isDarkTheme ? 'text-white' : 'text-gray-900') : 'text-white'
  const cardStyle = { backgroundColor: pageTheme.cardBg, borderColor: pageTheme.cardBorder, borderRadius: pageTheme.radius, boxShadow: pageTheme.cardShadow }
  const sectionAltStyle = { backgroundColor: pageTheme.sectionAlt }

  const sections = {
    hero: true,
    listings: true,
    about: true,
    news: true,
    footer: true,
    ...(profile?.page_sections ?? {}),
  }

  const pageConfig = {
    hero_headline: 'ابحث عن عقارك المثالي',
    featured_count: 6,
    listings_columns: 3 as 2 | 3 | 4,
    show_listing_filters: true,
    show_listing_search: true,
    hero_style: 'centered' as 'centered' | 'split' | 'minimal',
    hero_cta_text: 'تواصل عبر واتساب',
    button_shape: 'soft' as 'pill' | 'soft' | 'sharp',
    seo_title: '',
    seo_description: '',
    announcement_text: '',
    announcement_color: 'accent' as 'accent' | 'yellow' | 'green',
    ...(profile?.page_config ?? {}),
  }

  const btnRadius = pageConfig.button_shape === 'pill' ? '9999px' : pageConfig.button_shape === 'sharp' ? '0px' : pageConfig.button_shape === 'soft' ? pageTheme.radius : pageTheme.radius

  const whatsapp = profile?.social_links?.whatsapp
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً، وجدتك عبر موقعك ${tenant.name}`)}`
    : '#'

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

      <div className="min-h-screen" dir="rtl" style={{ backgroundColor: pageTheme.bg, color: isDarkTheme ? '#f8fafc' : '#111827' }}>

        {/* Sticky RTL Navbar */}
        <nav
          className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled ? 'backdrop-blur shadow-sm border-b' : 'bg-transparent'}`}
          style={scrolled ? { backgroundColor: pageTheme.navBg, borderColor: pageTheme.navBorder } : undefined}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {profile?.logo_url && (
                <Image src={profile.logo_url} alt={tenant.name} width={40} height={40}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover" priority={false} />
              )}
              <span className={`font-bold text-sm sm:text-lg ${navTextClass}`}>
                {tenant.name}
              </span>
            </div>
            {whatsapp && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 btn-primary text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
                </svg>
                <span className="hidden sm:inline">واتساب</span>
              </a>
            )}
          </div>
        </nav>

        {/* Announcement Banner */}
        {pageConfig.announcement_text && (
          <div
            className="w-full text-center text-sm font-medium py-2 px-4 sticky top-0 z-50"
            style={{
              backgroundColor: pageConfig.announcement_color === 'yellow' ? '#f59e0b' : pageConfig.announcement_color === 'green' ? '#22c55e' : primary,
              color: '#fff',
            }}
          >
            {pageConfig.announcement_text}
          </div>
        )}

        {/* Hero */}
        {sections.hero && pageConfig.hero_style === 'split' && (
          <section className="min-h-screen flex flex-col lg:flex-row items-stretch pt-14 sm:pt-16">
            <div className="relative flex-1 min-h-[40vh] lg:min-h-screen">
              {profile?.cover_url ? (
                <Image src={profile.cover_url} alt={tenant.name} fill className="object-cover" priority />
              ) : (
                <div className="w-full h-full min-h-[40vh]" style={{ background: `linear-gradient(135deg, ${primary}cc, ${primary}44)` }} />
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-16" style={{ backgroundColor: pageTheme.bg }}>
              {profile?.logo_url && (
                <Image src={profile.logo_url} alt={tenant.name} width={80} height={80} className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full mb-6 shadow-lg" />
              )}
              <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: pageTheme.headingFont, color: isDarkTheme ? '#f8fafc' : '#111827' }}>{tenant.name}</h1>
              {profile?.tagline && <p className="text-primary text-lg font-medium mb-3">{profile.tagline}</p>}
              <p className="text-base mb-8" style={{ color: isDarkTheme ? '#94a3b8' : '#6b7280' }}>{pageConfig.hero_headline}</p>
              {whatsapp && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="btn-primary text-white px-7 py-3 font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 w-fit"
                  style={{ borderRadius: btnRadius }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/></svg>
                  {pageConfig.hero_cta_text || 'تواصل عبر واتساب'}
                </a>
              )}
            </div>
          </section>
        )}

        {sections.hero && pageConfig.hero_style === 'minimal' && (
          <section className="pt-28 sm:pt-32 pb-16 px-4 text-center" style={{ backgroundColor: pageTheme.sectionAlt }}>
            {profile?.logo_url && (
              <Image src={profile.logo_url} alt={tenant.name} width={96} height={96} className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full object-contain mb-6 shadow" />
            )}
            <h1 className="text-4xl sm:text-6xl font-bold mb-4 leading-tight" style={{ fontFamily: pageTheme.headingFont, color: isDarkTheme ? '#f8fafc' : '#111827' }}>{tenant.name}</h1>
            <div className="w-16 h-1.5 mx-auto mb-5 rounded-full" style={{ backgroundColor: primary }} />
            {profile?.tagline && <p className="text-xl font-medium mb-3" style={{ color: primary }}>{profile.tagline}</p>}
            <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto" style={{ color: isDarkTheme ? '#94a3b8' : '#6b7280' }}>{pageConfig.hero_headline}</p>
            {whatsapp && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="btn-primary text-white px-8 py-3 font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                style={{ borderRadius: btnRadius }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/></svg>
                {pageConfig.hero_cta_text || 'تواصل عبر واتساب'}
              </a>
            )}
          </section>
        )}

        {sections.hero && (!pageConfig.hero_style || pageConfig.hero_style === 'centered') && (<section
          className="relative min-h-screen flex items-end justify-center pb-12 sm:pb-20 pt-24 sm:pt-28 bg-gray-900 bg-cover bg-center"
          style={profile?.cover_url ? { backgroundImage: `url(${profile.cover_url})` } : {}}
        >
          <div className="absolute inset-0" style={{ background: pageTheme.heroOverlay }} />
          <div className="relative z-10 text-center text-white px-4 max-w-2xl mx-auto w-full">
            <div
              className={`border rounded-3xl px-5 sm:px-8 py-7 sm:py-10 shadow-2xl mx-auto${pageTheme.heroCardBlur ? ' backdrop-blur-md' : ''}`}
              style={{ backgroundColor: pageTheme.heroCardBg, borderColor: pageTheme.heroCardBorder }}
            >
            {profile?.logo_url && (
              <Image
                src={profile.logo_url}
                alt={tenant.name}
                width={96}
                height={96}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto mb-4 rounded-full bg-white p-1 shadow-lg"
                priority={true}
              />
            )}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 leading-tight" style={{ fontFamily: pageTheme.headingFont }}>{tenant.name}</h1>
            {profile?.tagline && <p className="text-lg sm:text-xl md:text-2xl text-primary font-medium mb-4">{profile.tagline}</p>}
            <p className="text-base sm:text-lg text-white/80 mb-6 leading-relaxed">{pageConfig.hero_headline}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {whatsapp && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="btn-primary text-white px-6 sm:px-8 py-3 font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                  style={{ borderRadius: btnRadius }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
                  </svg>
                  {pageConfig.hero_cta_text || 'تواصل عبر واتساب'}
                </a>
              )}
            </div>
            </div>
          </div>
        </section>)}

        {/* Listings */}
        {sections.listings && publishedListings.length > 0 && (
          <section className="reveal py-12 sm:py-16 px-4 md:px-8 max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ fontFamily: pageTheme.headingFont }}>قائمة العقارات</h2>

            {pageConfig.show_listing_search && (
              <div className="mb-4">
                <input
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  placeholder="ابحث باسم العقار أو الموقع"
                  className="w-full border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: pageTheme.cardBorder, borderRadius: pageTheme.radius, ['--tw-ring-color' as any]: `${primary}55` }}
                />
              </div>
            )}

            {pageConfig.show_listing_filters && (
              <div className="flex flex-wrap gap-2 mb-8">
                {(['all', 'available', 'sold', 'rented'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatusFilter(f)}
                    className={`px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all border ${
                      statusFilter === f ? 'text-white border-transparent' : `${surfaceCardClass} hover:opacity-80`
                    }`}
                    style={statusFilter === f ? { backgroundColor: primary, borderColor: primary } : { backgroundColor: pageTheme.cardBg, borderColor: pageTheme.cardBorder }}
                    aria-label={`تصفية العقارات: ${f === 'all' ? 'الكل' : STATUS_LABELS[f]}`}
                    aria-pressed={statusFilter === f}
                  >
                    {f === 'all' ? 'الكل' : STATUS_LABELS[f]}
                  </button>
                ))}
              </div>
            )}

            {menuListings.length === 0 ? (
              <p className={`text-center py-12 ${mutedTextClass}`}>لا توجد عقارات لهذا التصنيف</p>
            ) : (
              <div className={`grid grid-cols-1 ${pageConfig.listings_columns === 2 ? 'sm:grid-cols-2' : pageConfig.listings_columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                {menuListings.map(l => (
                  <button key={l.id} onClick={() => setActiveListing(l)} className={`text-right group border overflow-hidden hover:shadow-xl transition-all ${surfaceCardClass}`} style={cardStyle} aria-label={`عرض تفاصيل العقار: ${l.title}`}>
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
                      <h3 className="font-semibold mb-1">{l.title}</h3>
                      {l.price != null && <p className="text-primary font-bold text-lg mb-1">{l.price.toLocaleString('ar-SA')} ر.س</p>}
                      {l.location && <p className={`text-sm mb-2 ${mutedTextClass}`}>📍 {l.location}</p>}
                      <div className={`flex gap-3 text-xs ${mutedTextClass}`}>
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
          <section className="reveal py-12 sm:py-16" style={sectionAltStyle}>
            <div className="px-4 md:px-8 max-w-7xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ fontFamily: pageTheme.headingFont }}>آخر الأخبار</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
                {news.map(item => (
                  <div key={item.id} className={`overflow-hidden shrink-0 snap-start w-[80vw] sm:w-80 max-w-80 border ${surfaceCardClass}`} style={cardStyle}>
                    {(item.image_url || item.images?.[0]) && <Image
                      src={item.image_url || item.images?.[0]}
                      alt={item.title}
                      width={320}
                      height={176}
                      className="w-full h-44 object-cover"
                      priority={false}
                    />}
                    <div className="p-5">
                      <p className={`text-xs mb-1 ${mutedTextClass}`}>
                        {new Date(item.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      {item.body && <p className={`text-sm line-clamp-3 ${mutedTextClass}`}>{item.body}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About */}
        {sections.about && (<section className="reveal py-12 sm:py-16 px-4 md:px-8 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: pageTheme.headingFont }}>من نحن</h2>
          {profile?.bio && <p className={`leading-relaxed text-base sm:text-lg ${bodyTextClass}`}>{profile.bio}</p>}
          {profile?.licence_no && (
            <p className={`mt-4 text-sm font-mono ${mutedTextClass}`}>رقم الترخيص: {profile.licence_no}</p>
          )}
        </section>)}

        {/* Footer */}
        {sections.footer && (<footer className="bg-gray-900 text-white py-10 sm:py-12 px-4 md:px-8 pb-24 sm:pb-12">
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
              {(profile?.extra_phones ?? []).filter(Boolean).map((num, i) => (
                <a key={i} href={`tel:${num}`} className="text-sm text-gray-300 hover:text-white block mb-2 transition-colors">
                  📞 {num}
                </a>
              ))}
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
                {profile?.social_links?.snapchat && (
                  <a href={`https://snapchat.com/add/${profile.social_links.snapchat.replace(/^https?:\/\/snapchat\.com\/add\//, '')}`} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-black transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12.166 2C9.033 2 6.6 3.64 5.567 6.227c-.28.706-.236 1.883-.198 2.81l.006.163c-.18.093-.407.134-.65.134-.34 0-.694-.096-.988-.27a.484.484 0 0 0-.252-.069c-.133 0-.264.04-.368.122-.155.12-.228.306-.197.497.064.39.508.683 1.11.875.05.015.1.03.147.047-.07.17-.127.35-.127.546 0 .148.032.287.086.415-.6.4-1.363.784-2.19.963a.507.507 0 0 0-.393.49c0 .273.199.501.47.537.94.124 1.59.59 2.073 1.066.41.404.587.8.526 1.214-.057.39-.38.696-.757.93a2.65 2.65 0 0 1-.355.187c-.272.115-.406.276-.406.495 0 .303.248.497.678.556.6.083 1.115.373 1.576.888.387.433.673 1.001.847 1.693.068.27.262.422.52.422.133 0 .272-.037.39-.104.43-.246.889-.371 1.364-.371.21 0 .424.026.637.077.522.127 1.025.403 1.542.693.747.42 1.52.855 2.486.855.964 0 1.742-.436 2.49-.856.516-.29 1.02-.566 1.54-.693.213-.05.427-.077.638-.077.475 0 .934.125 1.363.37.118.068.258.105.391.105.258 0 .452-.152.52-.422.174-.692.46-1.26.847-1.693.46-.515.977-.805 1.576-.888.43-.059.678-.253.678-.556 0-.219-.134-.38-.406-.495a2.65 2.65 0 0 1-.355-.187c-.377-.234-.7-.54-.757-.93-.061-.414.116-.81.526-1.214.483-.476 1.134-.942 2.073-1.066a.538.538 0 0 0 .47-.537.507.507 0 0 0-.394-.49c-.826-.179-1.589-.563-2.19-.963.054-.128.086-.267.086-.415 0-.197-.057-.376-.127-.546.048-.017.097-.032.147-.047.602-.192 1.046-.485 1.11-.875a.507.507 0 0 0-.197-.497.506.506 0 0 0-.368-.122.484.484 0 0 0-.252.069c-.294.174-.648.27-.988.27-.243 0-.47-.041-.65-.134l.006-.163c.038-.927.082-2.104-.198-2.81C17.4 3.64 14.966 2 11.834 2h.332z"/>
                    </svg>
                  </a>
                )}
                {profile?.social_links?.snapchat && (
                  <a href={`https://snapchat.com/add/${profile.social_links.snapchat.replace(/^https?:\/\/snapchat\.com\/add\//, '')}`} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-black transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12.166 2C9.033 2 6.6 3.64 5.567 6.227c-.28.706-.236 1.883-.198 2.81l.006.163c-.18.093-.407.134-.65.134-.34 0-.694-.096-.988-.27a.484.484 0 0 0-.252-.069c-.133 0-.264.04-.368.122-.155.12-.228.306-.197.497.064.39.508.683 1.11.875.05.015.1.03.147.047-.07.17-.127.35-.127.546 0 .148.032.287.086.415-.6.4-1.363.784-2.19.963a.507.507 0 0 0-.393.49c0 .273.199.501.47.537.94.124 1.59.59 2.073 1.066.41.404.587.8.526 1.214-.057.39-.38.696-.757.93a2.65 2.65 0 0 1-.355.187c-.272.115-.406.276-.406.495 0 .303.248.497.678.556.6.083 1.115.373 1.576.888.387.433.673 1.001.847 1.693.068.27.262.422.52.422.133 0 .272-.037.39-.104.43-.246.889-.371 1.364-.371.21 0 .424.026.637.077.522.127 1.025.403 1.542.693.747.42 1.52.855 2.486.855.964 0 1.742-.436 2.49-.856.516-.29 1.02-.566 1.54-.693.213-.05.427-.077.638-.077.475 0 .934.125 1.363.37.118.068.258.105.391.105.258 0 .452-.152.52-.422.174-.692.46-1.26.847-1.693.46-.515.977-.805 1.576-.888.43-.059.678-.253.678-.556 0-.219-.134-.38-.406-.495a2.65 2.65 0 0 1-.355-.187c-.377-.234-.7-.54-.757-.93-.061-.414.116-.81.526-1.214.483-.476 1.134-.942 2.073-1.066a.538.538 0 0 0 .47-.537.507.507 0 0 0-.394-.49c-.826-.179-1.589-.563-2.19-.963.054-.128.086-.267.086-.415 0-.197-.057-.376-.127-.546.048-.017.097-.032.147-.047.602-.192 1.046-.485 1.11-.875a.507.507 0 0 0-.197-.497.506.506 0 0 0-.368-.122.484.484 0 0 0-.252.069c-.294.174-.648.27-.988.27-.243 0-.47-.041-.65-.134l.006-.163c.038-.927.082-2.104-.198-2.81C17.4 3.64 14.966 2 11.834 2h.332z"/>
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

        {/* Float contact button (WhatsApp only) */}
        <FloatContactButtons
          whatsapp={profile?.social_links?.whatsapp}
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
      </div>
    </>

  )
}
