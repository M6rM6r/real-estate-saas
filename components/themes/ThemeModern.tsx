'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { PAGE_THEMES } from '@/lib/types'
import { PropertyDetailModal } from '@/components/PropertyDetailModal'
import { FloatContactButtons } from '@/components/FloatContactButtons'
import {
  ThemePageProps, Post,
  STATUS_LABELS, STATUS_COLORS, CURRENCY_SYMBOLS,
  getPageConfig, getPageSections, getSectionOrderMap, buildWaLink, getBtnRadius,
  SocialLinks, WorkingHours, PropertyCard, THEME_LABELS,
} from './shared'

export default function ThemeModern({ tenant, profile, listings, news, gallery: _gallery, team: _team, isPreview = false }: ThemePageProps) {
  const primary = tenant.primary_color ?? '#2563eb'
  const pageTheme = PAGE_THEMES[(tenant.theme as keyof typeof PAGE_THEMES) ?? 'modern'] ?? PAGE_THEMES.modern
  const isDark = pageTheme.dark
  const pageConfig = getPageConfig(profile)
  const lang = pageConfig.page_lang ?? 'ar'
  const L = THEME_LABELS[lang]
  const sections = getPageSections(profile)
  const sectionOrder = getSectionOrderMap(profile)
  const waLink = buildWaLink(tenant, profile, lang)
  const btnRadius = getBtnRadius(pageConfig.button_shape, pageTheme.radius)

  const [activeListing, setActiveListing] = useState<Post | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [offerFilter, setOfferFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortPrice, setSortPrice] = useState<'none' | 'asc' | 'desc'>('none')
  const [listingSearch, setListingSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const surfaceClass = isDark ? 'text-white' : 'text-gray-900'
  const bodyClass = isDark ? 'text-slate-300' : 'text-gray-600'
  const mutedClass = isDark ? 'text-slate-400' : 'text-gray-500'
  const navTextClass = scrolled ? (isDark ? 'text-white' : 'text-gray-900') : 'text-white'
  const cardStyle = { backgroundColor: pageTheme.cardBg, borderColor: pageTheme.cardBorder, borderRadius: pageTheme.radius, boxShadow: pageTheme.cardShadow }
  const whatsapp = profile?.social_links?.whatsapp
  const waDisplay = whatsapp ? '+' + whatsapp.replace(/\D/g, '') : ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('revealed') }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [listings, news])

  const published = listings.filter(l => l.published !== false)
  const propertyTypes = Array.from(new Set(published.map(l => l.property_type).filter(Boolean))) as string[]
  const filtered = published
    .filter(l => statusFilter === 'all' || l.listing_status === statusFilter)
    .filter(l => offerFilter === 'all' || l.offer_type === offerFilter)
    .filter(l => typeFilter === 'all' || l.property_type === typeFilter)
  const sorted = sortPrice === 'none' ? filtered : [...filtered].sort((a, b) =>
    sortPrice === 'asc' ? (a.price ?? 0) - (b.price ?? 0) : (b.price ?? 0) - (a.price ?? 0)
  )
  const displayed = listingSearch.trim()
    ? sorted.filter(l => `${l.title} ${l.location ?? ''}`.toLowerCase().includes(listingSearch.toLowerCase()))
    : sorted

  const bannerPt = 'pt-14 sm:pt-16'

  return (
    <>
      <style>{`
        :root { --primary: ${primary}; }
        .btn-primary { background: var(--primary); }
        .text-primary { color: var(--primary); }
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .revealed { opacity: 1; transform: translateY(0); }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        @supports(padding-bottom:env(safe-area-inset-bottom)){
          .safe-pb { padding-bottom: calc(1rem + env(safe-area-inset-bottom)); }
        }
      `}</style>

      <div className="min-h-screen flex flex-col" dir={lang === 'en' ? 'ltr' : 'rtl'} style={{ backgroundColor: pageTheme.bg, color: isDark ? '#f8fafc' : '#111827' }}>

        {/* Header */}
        <header className={`${isPreview ? 'sticky' : 'fixed'} top-0 inset-x-0 z-40 flex flex-col`}>
          <nav className={`transition-all duration-300 ${scrolled ? 'backdrop-blur shadow-sm border-b' : 'bg-transparent'}`}
            style={scrolled ? { backgroundColor: pageTheme.navBg, borderColor: pageTheme.navBorder } : undefined}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {profile?.logo_url ? (
                  <Image src={profile.logo_url} alt={tenant.name} width={40} height={40} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20" />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: primary }}>
                    {tenant.name.charAt(0)}
                  </div>
                )}
                <span className={`font-bold text-sm sm:text-base ${navTextClass} drop-shadow-sm`}>{tenant.name}</span>
              </div>

            </div>
          </nav>
        </header>

        {/* Hero — split */}
        {sections.hero && pageConfig.hero_style === 'split' && (
          <section data-section="hero" className={`min-h-screen flex flex-col lg:flex-row items-stretch ${bannerPt}`} style={{ order: sectionOrder.hero }}>
            <div className="relative flex-1 min-h-[40vh] lg:min-h-screen">
              {profile?.cover_url ? <Image src={profile.cover_url} alt={tenant.name} fill className="object-cover" priority /> : <div className="w-full h-full min-h-[40vh]" style={{ background: `linear-gradient(135deg, ${primary}cc, ${primary}44)` }} />}
            </div>
            <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-16" style={{ backgroundColor: pageTheme.bg }}>
              {profile?.logo_url && <Image src={profile.logo_url} alt={tenant.name} width={80} height={80} className="w-16 h-16 object-contain rounded-full mb-6 shadow-lg" />}
              <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: pageTheme.headingFont, color: isDark ? '#f8fafc' : '#111827' }}>{tenant.name}</h1>
              {profile?.tagline && <p className="text-lg font-medium mb-3 text-primary">{profile.tagline}</p>}
              {pageConfig.hero_headline && pageConfig.hero_headline !== profile?.tagline && <p className="text-base mb-8" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>{pageConfig.hero_headline}</p>}

            </div>
          </section>
        )}

        {/* Hero — minimal */}
        {sections.hero && pageConfig.hero_style === 'minimal' && (
          <section data-section="hero" className="pb-16 px-4 text-center pt-28 sm:pt-32" style={{ backgroundColor: pageTheme.sectionAlt, order: sectionOrder.hero }}>
            {profile?.logo_url && <Image src={profile.logo_url} alt={tenant.name} width={96} height={96} className="w-20 h-20 mx-auto rounded-full object-contain mb-6 shadow" />}
            <h1 className="text-4xl sm:text-6xl font-bold mb-4 leading-tight" style={{ fontFamily: pageTheme.headingFont, color: isDark ? '#f8fafc' : '#111827' }}>{tenant.name}</h1>
            <div className="w-16 h-1.5 mx-auto mb-5 rounded-full" style={{ backgroundColor: primary }} />
            {profile?.tagline && <p className="text-xl font-medium mb-3 text-primary">{profile.tagline}</p>}
            {pageConfig.hero_headline && pageConfig.hero_headline !== profile?.tagline && <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>{pageConfig.hero_headline}</p>}

          </section>
        )}

        {/* Hero — centered (default) */}
        {sections.hero && (!pageConfig.hero_style || pageConfig.hero_style === 'centered') && (
          <section data-section="hero" className="relative min-h-[100dvh] flex flex-col items-center justify-end pb-10 sm:pb-20 bg-cover bg-center pt-24 sm:pt-28"
            style={{ order: sectionOrder.hero, background: `linear-gradient(135deg, ${primary}55 0%, ${pageTheme.bg} 55%, ${primary}33 100%)` }}>
            {profile?.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.cover_url} alt={tenant.name} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0" style={{ background: pageTheme.heroOverlay }} />
            <div className="relative z-10 text-center text-white px-4 max-w-2xl mx-auto w-full">
              <div className={`border rounded-3xl px-5 sm:px-8 py-7 sm:py-10 shadow-2xl mx-auto${pageTheme.heroCardBlur ? ' backdrop-blur-md' : ''}`}
                style={{ backgroundColor: pageTheme.heroCardBg, borderColor: pageTheme.heroCardBorder }}>
                {profile?.logo_url && <Image src={profile.logo_url} alt={tenant.name} width={96} height={96} className="w-20 h-20 object-contain mx-auto mb-4 rounded-full bg-white p-1 shadow-lg" priority />}
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 leading-tight tracking-tight" style={{ fontFamily: pageTheme.headingFont }}>{tenant.name}</h1>
                {profile?.tagline && <p className="text-base sm:text-xl font-medium mb-3 opacity-90" style={{ color: primary === '#2563eb' ? '#93c5fd' : primary }}>{profile.tagline}</p>}
                {pageConfig.hero_headline && pageConfig.hero_headline !== profile?.tagline && <p className="text-sm sm:text-lg text-white/75 mb-6">{pageConfig.hero_headline}</p>}
              </div>
            </div>
            {/* Scroll indicator */}
            <div className="relative z-10 mt-6 flex flex-col items-center gap-1 opacity-60">
              <span className="text-white text-xs">استعرض</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </section>
        )}

        {/* Listings */}
        {sections.listings && published.length > 0 && (
          <section data-section="listings" className="reveal py-12 sm:py-16 px-4 md:px-8 max-w-7xl mx-auto" style={{ order: sectionOrder.listings }}>

            {pageConfig.show_listing_search && (
              <div className="mb-4">
                <input value={listingSearch} onChange={e => setListingSearch(e.target.value)}
                  placeholder="ابحث باسم العرض أو الموقع"
                  className="w-full border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: pageTheme.cardBorder, borderRadius: pageTheme.radius }} />
              </div>
            )}
            {pageConfig.show_listing_filters && (
              <div className="space-y-2.5 mb-6">
                {/* Property type chips */}
                {propertyTypes.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {(['all', ...propertyTypes]).map(f => (
                      <button key={f} type="button" onClick={() => setTypeFilter(f)}
                        className={`shrink-0 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium transition-all border active:scale-95 ${typeFilter === f ? 'text-white border-transparent' : `${surfaceClass} hover:opacity-80`}`}
                        style={typeFilter === f ? { backgroundColor: primary, borderColor: primary } : { backgroundColor: pageTheme.cardBg, borderColor: pageTheme.cardBorder }}>
                        {f === 'all' ? (pageConfig.filter_label_all_types ?? 'كل الأنواع') : f}
                      </button>
                    ))}
                  </div>
                )}
                {/* Status + sort row */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {(['all', 'available', 'sold', 'rented'] as const).map(f => (
                    <button key={f} type="button" onClick={() => setStatusFilter(f)}
                      className={`shrink-0 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium transition-all border active:scale-95 ${statusFilter === f ? 'text-white border-transparent' : `${surfaceClass} hover:opacity-80`}`}
                      style={statusFilter === f ? { backgroundColor: primary, borderColor: primary } : { backgroundColor: pageTheme.cardBg, borderColor: pageTheme.cardBorder }}>
                      {f === 'all' ? (pageConfig.filter_label_all_status ?? 'كل الحالات') : STATUS_LABELS[f]}
                    </button>
                  ))}
                  <select value={sortPrice} onChange={e => setSortPrice(e.target.value as 'none' | 'asc' | 'desc')}
                    className="shrink-0 mr-auto text-xs px-3 py-2 border rounded-full focus:outline-none cursor-pointer"
                    style={{ backgroundColor: pageTheme.cardBg, borderColor: pageTheme.cardBorder, color: isDark ? '#fff' : '#111' }}>
                    <option value="none">ترتيب السعر</option>
                    <option value="desc">الأعلى سعراً</option>
                    <option value="asc">الأقل سعراً</option>
                  </select>
                </div>
              </div>
            )}
            {displayed.length === 0 ? (
              <p className={`text-center py-12 ${mutedClass}`}>لا توجد عروض لهذا التصنيف</p>
            ) : (
              <div className={`grid grid-cols-1 ${pageConfig.listings_columns === 2 ? 'sm:grid-cols-2' : pageConfig.listings_columns === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-2 md:grid-cols-3'} gap-6`}>
                {displayed.map(l => (
                  <PropertyCard key={l.id} listing={l} onClick={() => setActiveListing(l)} cardStyle={cardStyle} surfaceClass={surfaceClass} mutedClass={mutedClass} primary={primary} sectionAlt={pageTheme.sectionAlt} currency={pageConfig.currency} showRealEstateFields={!tenant.business_type || tenant.business_type === 'real_estate'} offerLabel1={pageConfig.offer_label_1} offerLabel2={pageConfig.offer_label_2} lang={lang} statusLabels={THEME_LABELS[lang].statusLabels} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* News */}
        {sections.news && news.length > 0 && (
          <section data-section="news" className="reveal py-12 sm:py-16" style={{ backgroundColor: pageTheme.sectionAlt, order: sectionOrder.news }}>
            <div className="px-4 md:px-8 max-w-7xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ fontFamily: pageTheme.headingFont }}>{L.newsHeading}</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {news.map(item => (
                  <div key={item.id} className={`overflow-hidden shrink-0 snap-start w-[80vw] sm:w-80 border ${surfaceClass}`} style={cardStyle}>
                    {(item.image_url || item.images?.[0]) && <Image src={(item.image_url || item.images?.[0]) as string} alt={item.title} width={320} height={176} className="w-full h-44 object-cover" />}
                    <div className="p-5">
                      <p className={`text-xs mb-1 ${mutedClass}`}>{new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      {item.body && <p className={`text-sm line-clamp-3 ${mutedClass}`}>{item.body}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About */}
        {sections.about && (
          <section data-section="about" className="reveal py-12 sm:py-16 px-4 md:px-8 max-w-3xl mx-auto text-center" style={{ order: sectionOrder.about }}>

            {profile?.bio && <p className={`leading-relaxed text-base sm:text-lg ${bodyClass}`}>{profile.bio}</p>}
            {(profile?.licence_numbers && profile.licence_numbers.length > 0)
              ? profile.licence_numbers.map((l, i) => (
                  <p key={i} className={`mt-2 text-xs font-mono ${mutedClass}`}>{l.label ? `${l.label}: ` : `${L.licencePrefix} `}{l.number}</p>
                ))
              : profile?.licence_no && <p className={`mt-4 text-sm font-mono ${mutedClass}`}>{L.licencePrefix} {profile.licence_no}</p>
            }
          </section>
        )}

        {/* Contact */}
        {sections.contact && (whatsapp || profile?.contact_phone || profile?.contact_email) && (
          <section data-section="contact" className="reveal py-12 sm:py-16 px-4 md:px-8" style={{ backgroundColor: pageTheme.sectionAlt, order: sectionOrder.contact }}>
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: pageTheme.headingFont }}>{L.contactHeading}</h2>
              <p className={`text-sm mb-8 ${mutedClass}`}>{L.contactSubtitle}</p>
              <div className="flex flex-col items-center gap-3" dir="ltr">
                {whatsapp && <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90" style={{ backgroundColor: '#25D366' }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/></svg> واتساب: {waDisplay}</a>}
                {profile?.contact_phone && <a href={`tel:${profile.contact_phone}`} className={`flex items-center gap-2 text-sm font-medium ${mutedClass} hover:underline`} dir="ltr"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {profile.contact_phone}</a>}
                {profile?.contact_email && <a href={`mailto:${profile.contact_email}`} className={`flex items-center gap-2 text-sm font-medium ${mutedClass} hover:underline`} dir="ltr"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg> {profile.contact_email}</a>}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        {sections.footer && (
          <footer className="bg-gray-900 text-white py-10 sm:py-12 px-4 md:px-8 pb-28 sm:pb-12 safe-pb" style={{ order: sectionOrder.footer }}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                {profile?.logo_url && <Image src={profile.logo_url} alt={tenant.name} width={64} height={64} className="w-16 h-16 object-contain mb-3 rounded" />}
                <h3 className="text-xl font-bold">{tenant.name}</h3>
                {profile?.bio && <p className="text-gray-400 text-sm mt-2 line-clamp-3">{profile.bio}</p>}
                {profile?.contact_address && <p className="flex items-center gap-2 text-gray-300 text-sm mt-4"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0 text-gray-400"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> {profile.contact_address}</p>}
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">التواصل</h4>
                {whatsapp && <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-2" dir="ltr"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0 text-green-400"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/></svg> {waDisplay}</a>}
                {profile?.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-2" dir="ltr"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0 text-gray-400"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg> {profile.contact_email}</a>}
                <div className="mt-4"><SocialLinks profile={profile} waLink={waLink} /></div>
                {sections.working_hours && profile?.working_hours && (
                  <div className="mt-6 pt-4 border-t border-gray-800">
                    <h5 className="font-semibold text-sm text-gray-300 mb-2">{L.workingHoursHeading}</h5>
                    <WorkingHours hours={profile.working_hours} lang={lang} />
                  </div>
                )}
              </div>

            </div>
            <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
              {L.footerCopyright} © {new Date().getFullYear()} {tenant.name}
            </div>
          </footer>
        )}

        {!isPreview && sections.contact && <FloatContactButtons whatsapp={profile?.social_links?.whatsapp} accentColor={primary} />}
        {activeListing && (
          <PropertyDetailModal
            property={activeListing as Parameters<typeof PropertyDetailModal>[0]['property']}
            onClose={() => setActiveListing(null)}
            slug={tenant.slug}
            tenantId={tenant.id}
            accentColor={primary}
            lang={lang}
          />
        )}
      </div>
    </>
  )
}
