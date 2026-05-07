'use client'

/**
 * Desert Theme Layout
 * ─────────────────────────────────────────────────────────────
 * - Hero: full-bleed warm overlay, NO card, HUGE bold text, scroll arrow
 * - Featured listing: first listing as wide horizontal card
 * - Remaining listings: 4-column compact grid
 * - About: warm card with licence badge prominent
 * - News: large horizontal scroll cards
 * - Footer: warm dark (brown-black)
 */

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { PAGE_THEMES } from '@/lib/types'
import { PropertyDetailModal } from '@/components/PropertyDetailModal'
import { FloatContactButtons } from '@/components/FloatContactButtons'
import {
  ThemePageProps, Post,
  STATUS_LABELS, STATUS_COLORS, CURRENCY_SYMBOLS,
  getPageConfig, getPageSections, getSectionOrderMap, buildWaLink, getBtnRadius,
  SocialLinks, WorkingHours, WaIcon, ListingBadges, PropertyCard, EmptyState, THEME_LABELS,
} from './shared'

export default function ThemeDesert({ tenant, profile, listings, news, gallery: _gallery, team: _team, isPreview = false }: ThemePageProps) {
  const primary = tenant.primary_color ?? '#d97706'
  const pageTheme = PAGE_THEMES['desert'] ?? PAGE_THEMES.modern
  const pageConfig = getPageConfig(profile)
  const lang = pageConfig.page_lang ?? 'ar'
  const L = THEME_LABELS[lang]
  const sections = getPageSections(profile)
  const sectionOrder = getSectionOrderMap(profile)
  const waLink = buildWaLink(tenant, profile, lang)
  const btnRadius = getBtnRadius(pageConfig.button_shape, pageTheme.radius)
  const currency = pageConfig.currency ?? 'SAR'

  const [activeListing, setActiveListing] = useState<Post | null>(null)
  const [offerFilter, setOfferFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortPrice, setSortPrice] = useState<'none' | 'asc' | 'desc' | 'newest'>('none')
  const [scrolled, setScrolled] = useState(false)

  const whatsapp = profile?.social_links?.whatsapp
  const waDisplay = whatsapp ? '+' + whatsapp.replace(/\D/g, '') : ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('dsr-revealed') }),
      { threshold: 0.06 }
    )
    document.querySelectorAll('.dsr-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [listings, news])

  const published = listings.filter(l => l.published !== false)
  const propertyTypes = Array.from(new Set(published.map(l => l.property_type).filter(Boolean))) as string[]
  const baseFiltered = published
    .filter(l => offerFilter === 'all' || l.offer_type === offerFilter)
    .filter(l => typeFilter === 'all' || l.property_type === typeFilter)
  const filtered = sortPrice === 'none' ? baseFiltered : [...baseFiltered].sort((a, b) =>
    sortPrice === 'newest'
      ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      : sortPrice === 'asc' ? (a.price ?? 0) - (b.price ?? 0) : (b.price ?? 0) - (a.price ?? 0)
  )
  const featured = filtered[0] ?? null
  const compact = filtered.slice(1)
  const colsClass = pageConfig.listings_columns === 2
    ? 'sm:grid-cols-2'
    : pageConfig.listings_columns === 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : 'sm:grid-cols-2 md:grid-cols-3'

  const cardStyle = {
    backgroundColor: pageTheme.cardBg,
    borderColor: pageTheme.cardBorder,
    borderRadius: pageTheme.radius,
    boxShadow: pageTheme.cardShadow,
  }

  return (
    <>
      <style>{`
        :root { --dsr-primary: ${primary}; }
        .dsr-reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.75s ease, transform 0.75s ease; }
        .dsr-revealed { opacity: 1; transform: translateY(0); }
        .dsr-btn { background: var(--dsr-primary); }
        .dsr-text { color: var(--dsr-primary); }
        .dsr-chip-active { background: var(--dsr-primary); color: #fff; border-color: var(--dsr-primary); }
      `}</style>

      <div className="min-h-screen flex flex-col" dir={lang === 'en' ? 'ltr' : 'rtl'} style={{ backgroundColor: pageTheme.bg, color: '#fef3c7' }}>

        {/* Navbar — minimal */}
        <nav className="fixed inset-x-0 z-40 transition-all duration-400 top-0" style={scrolled ? { backgroundColor: pageTheme.navBg, borderColor: pageTheme.navBorder } : undefined}>
          <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile?.logo_url ? (
                <Image src={profile.logo_url} alt={tenant.name} width={40} height={40} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: primary }}>
                  {tenant.name.charAt(0)}
                </div>
              )}
              <span className="font-black text-sm sm:text-base tracking-wide text-white" style={{ textShadow: scrolled ? 'none' : '0 1px 4px rgba(0,0,0,0.5)' }}>
                {tenant.name}
              </span>
            </div>

          </div>
        </nav>

        {/* Hero — no card, HUGE text */}
        {sections.hero && (
          <section data-section="hero" className="relative min-h-[55vh] flex items-center justify-center overflow-hidden" style={{ order: sectionOrder.hero }}>
            {profile?.cover_url ? (
              <Image src={profile.cover_url} alt={tenant.name} fill className="object-cover" priority />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: `linear-gradient(160deg, #3d1f04 0%, #7c3a0c 60%, ${primary} 100%)` }}>
                {isPreview && (
                  <div className="flex flex-col items-center justify-center gap-2 text-white/50 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-60 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <p className="text-xs font-medium text-center px-4">{lang === 'en' ? 'Add a cover photo to enhance your page' : 'أضف صورة غلاف لتحسين مظهر صفحتك'}</p>
                  </div>
                )}
              </div>
            )}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, rgba(45,26,10,0.75) 0%, rgba(217,119,6,0.45) 100%)` }} />
            <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto w-full pt-20">
              {profile?.logo_url && (
                <Image src={profile.logo_url} alt={tenant.name} width={72} height={72} className="w-16 h-16 object-contain mx-auto mb-6 opacity-90 rounded-full" priority />
              )}
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-black leading-none mb-4 tracking-tight uppercase"
                style={{ fontFamily: pageTheme.headingFont, letterSpacing: '-0.03em', textShadow: '0 4px 32px rgba(0,0,0,0.5)' }}>
                {tenant.name}
              </h1>
              {profile?.tagline && (
                <p className="text-xl sm:text-2xl font-semibold mb-4 tracking-widest" style={{ color: `${primary}ee` }}>
                  {profile.tagline}
                </p>
              )}
              {pageConfig.hero_headline && pageConfig.hero_headline !== profile?.tagline && (
                <p className="text-white/70 text-base sm:text-xl mb-10 max-w-2xl mx-auto font-light">
                  {pageConfig.hero_headline}
                </p>
              )}

            </div>
            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <div className="w-6 h-9 rounded-full border-2 flex items-start justify-center pt-1.5" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
                <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
              </div>
              <span className="text-xs tracking-widest text-white/40 uppercase">اكتشف</span>
            </div>
          </section>
        )}

        {/* Featured listing — wide horizontal */}
        {sections.listings && (
          <section data-section="listings" className="dsr-reveal py-14 px-4 md:px-8 max-w-7xl mx-auto" style={{ order: sectionOrder.listings }}>
            <div className="flex items-center gap-3 mb-7">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 shrink-0" style={{ color: primary }}><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd"/></svg>
              <h2 className="text-2xl sm:text-3xl font-black" style={{ fontFamily: pageTheme.headingFont, color: '#fef3c7' }}>{THEME_LABELS[lang].listingsHeading}</h2>
              <div className="flex-1 h-px ml-4" style={{ background: `linear-gradient(to right, ${primary}66, transparent)` }} />
            </div>
            {pageConfig.show_listing_filters && propertyTypes.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 mb-3 -mx-4 px-4 sm:mx-0 sm:px-0" style={{scrollbarWidth:'none'}}>
                {(['all', ...propertyTypes]).map(f => (
                  <button key={f} type="button" onClick={() => setTypeFilter(f)}
                    className="shrink-0 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium transition-all border active:scale-95"
                    style={typeFilter === f ? { backgroundColor: primary, borderColor: primary, color: '#fff' } : { backgroundColor: pageTheme.cardBg, borderColor: pageTheme.cardBorder, color: '#d1c7b8' }}>
                    {f === 'all' ? (pageConfig.filter_label_all_types ?? 'كل الأنواع') : f}
                  </button>
                ))}
              </div>
            )}
            {pageConfig.show_listing_sort !== false && (
              <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0" style={{scrollbarWidth:'none'}}>
                {(['newest', 'desc', 'asc'] as const).map(opt => (
                  <button key={opt} type="button"
                    onClick={() => setSortPrice(prev => prev === opt ? 'none' : opt)}
                    className="shrink-0 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium transition-all border active:scale-95"
                    style={sortPrice === opt ? { backgroundColor: primary, borderColor: primary, color: '#fff' } : { backgroundColor: pageTheme.cardBg, borderColor: pageTheme.cardBorder, color: '#d1c7b8' }}>
                    {opt === 'newest' ? 'الأحدث' : opt === 'desc' ? 'الأعلى سعراً' : 'الأقل سعراً'}
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 && <EmptyState icon="listings" accent={primary} lang={lang} />}

            {/* Featured */}
            {featured && <button className="w-full text-right border overflow-hidden mb-8 group block hover:shadow-xl transition-all"
              style={{ borderColor: `${primary}50`, borderRadius: pageTheme.radius, backgroundColor: pageTheme.cardBg }}
              onClick={() => setActiveListing(featured)}>
              <div className="flex flex-col md:flex-row">
                {/* Image on right for RTL */}
                <div className="relative h-60 md:h-80 md:w-1/2 order-last md:order-last">
                  {featured.images[0] ? (
                    <Image src={featured.images[0]} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: pageTheme.cardBorder }} />
                  )}
                  <ListingBadges listing={featured} primary={primary} lang={lang} statusLabels={THEME_LABELS[lang].statusLabels} />
                </div>
                {/* Details on left */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
                  <span className="text-xs font-bold tracking-widest uppercase mb-3 dsr-text">عرض مميز</span>
                  <h3 className="text-2xl sm:text-3xl font-black mb-3" style={{ fontFamily: pageTheme.headingFont }}>{featured.title}</h3>
                  {featured.price != null && (
                    <p className="text-2xl font-black dsr-text mb-3">
                      {featured.price.toLocaleString('en-US')} {CURRENCY_SYMBOLS[currency] ?? currency}
                    </p>
                  )}
                  {featured.location && <p className="text-sm text-gray-400 mb-4 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> {featured.location}</p>}
                  <div className="flex gap-4 text-sm text-gray-400 mb-5">
                    {tenant.business_type === 'car_dealer' ? (
                      <>
                        {featured.bedrooms != null && <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M6.5 3.75a.75.75 0 00-1.5 0v10.5a.75.75 0 001.5 0V3.75z"/></svg> {featured.bedrooms}</span>}
                        {featured.bathrooms != null && <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 014.25 2h11.5A2.25 2.25 0 0118 4.25v8.5A2.25 2.25 0 0115.75 15h-3.105a3.501 3.501 0 001.1 1.677A.75.75 0 0113.26 18H6.74a.75.75 0 01-.484-1.323A3.501 3.501 0 007.355 15H4.25A2.25 2.25 0 012 12.75v-8.5z" clipRule="evenodd"/></svg> {featured.bathrooms} km</span>}
                        {featured.property_type && <span>{featured.property_type}</span>}
                      </>
                    ) : (
                      <>
                        {featured.bedrooms != null && <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M2.879 7.121A3 3 0 007.5 6.196a3.001 3.001 0 002.634 1.55 3 3 0 002.584-1.435 3.001 3.001 0 002.298 1.38 3 3 0 001.9-5.34.75.75 0 00-.812-.14L14.648 3H5.353l-1.455-.439a.75.75 0 00-.812.14 3 3 0 00-.207 4.42zM4 12v-2.586l.311.311A4.491 4.491 0 007.5 11c1.123 0 2.151-.4 2.94-1.059.749.659 1.727 1.059 2.81 1.059 1.083 0 2.062-.4 2.811-1.059.345.304.733.546 1.152.713L17.5 11V12H4z"/></svg> {featured.bedrooms}</span>}
                        {featured.bathrooms != null && <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5V11h-.5a.5.5 0 00-.5.5v1A3.5 3.5 0 005.5 16v.5a.5.5 0 001 0V16h7v.5a.5.5 0 001 0V16a3.5 3.5 0 003.5-3.5v-1a.5.5 0 00-.5-.5H17V3.5A1.5 1.5 0 0015.5 2h-11z" clipRule="evenodd"/></svg> {featured.bathrooms}</span>}
                        {featured.area_sqm != null && <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M1 2.75A.75.75 0 011.75 2h16.5a.75.75 0 010 1.5H17v10.75a.75.75 0 01-1.5 0V3.5H4.5v10.75a.75.75 0 01-1.5 0V3.5H1.75A.75.75 0 011 2.75z" clipRule="evenodd"/></svg> {featured.area_sqm} م²</span>}
                      </>
                    )}
                  </div>
                  <span className="dsr-btn text-white px-6 py-2.5 text-sm font-bold inline-block w-fit"
                    style={{ borderRadius: btnRadius }}>
                    عرض التفاصيل
                  </span>
                </div>
              </div>
            </button>}

            {/* Remaining listings */}
            {compact.length > 0 && (
              <div className={`grid grid-cols-1 ${colsClass} gap-4`}>
                {compact.map(l => (
                  <button key={l.id} className="text-right border overflow-hidden group block hover:shadow-md transition-all"
                    style={{ borderColor: `${primary}30`, borderRadius: pageTheme.radius, backgroundColor: pageTheme.cardBg }}
                    onClick={() => setActiveListing(l)}>
                    <div className="relative h-36">
                      {l.images[0] ? (
                        <Image src={l.images[0]} alt={l.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: '#f5e6c8' }} />
                      )}
                      <ListingBadges listing={l} primary={primary} lang={lang} statusLabels={THEME_LABELS[lang].statusLabels} />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold mb-1 line-clamp-1 text-gray-100">{l.title}</h3>
                      {l.price != null && <p className="text-sm font-black dsr-text">{l.price.toLocaleString('en-US')}</p>}
                      {l.location && <p className="text-xs text-gray-400 mt-1 line-clamp-1 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 shrink-0"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> {l.location}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* About — warm card */}
        {sections.about && (
          <section data-section="about" className="dsr-reveal py-12 px-4 md:px-8" style={{ backgroundColor: pageTheme.sectionAlt, order: sectionOrder.about }}>
            <div className="max-w-5xl mx-auto">
              <div className="border p-8 sm:p-10" style={{ borderColor: pageTheme.cardBorder, borderRadius: pageTheme.radius, backgroundColor: pageTheme.cardBg }}>
                <div className="flex flex-col sm:flex-row items-start gap-8">
                  {profile?.logo_url && (
                    <Image src={profile.logo_url} alt={tenant.name} width={96} height={96} className="w-24 h-24 rounded-full object-contain shadow border shrink-0" style={{ borderColor: `${primary}40` }} />
                  )}
                  <div className="flex-1">

                    {profile?.bio && <p className="text-gray-400 leading-relaxed mb-4">{profile.bio}</p>}
                    <div className="flex flex-wrap gap-3">
                      {(profile?.licence_numbers && profile.licence_numbers.length > 0)
                        ? profile.licence_numbers.map((l, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: `${primary}18`, color: primary }}>
                              🏙 {l.label ? `${l.label}: ` : `${L.licencePrefix} `}{l.number}
                            </span>
                          ))
                        : profile?.licence_no && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: `${primary}18`, color: primary }}>
                              🏙 {L.licencePrefix} {profile.licence_no}
                            </span>
                          )
                      }
                      {profile?.contact_address && (
                        <span className="text-xs text-gray-400 flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 shrink-0"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> {profile.contact_address}</span>
                      )}
                    </div>
                    {(profile?.contact_phone || profile?.contact_email) && (
                      <div className="mt-4 flex flex-wrap gap-4">
                        {profile.contact_phone && <a href={`tel:${profile.contact_phone}`} className="flex items-center gap-2 text-sm font-semibold dsr-text hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {profile.contact_phone}</a>}
                        {(profile?.extra_phones ?? []).filter(Boolean).map((n, i) => (
                          <a key={i} href={`tel:${n}`} className="flex items-center gap-2 text-sm font-semibold dsr-text hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {n}</a>
                        ))}
                        {profile.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-sm font-semibold dsr-text hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg> {profile.contact_email}</a>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* News — large horizontal cards */}
        {sections.news && news.length > 0 && (
          <section data-section="news" className="dsr-reveal py-14 px-4 md:px-8 max-w-7xl mx-auto" style={{ order: sectionOrder.news }}>
            <h2 className="text-2xl sm:text-3xl font-black mb-8" style={{ fontFamily: pageTheme.headingFont }}>{L.newsHeading}</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
              {news.map(item => (
                <div key={item.id} className="shrink-0 snap-start w-72 sm:w-80 overflow-hidden border" style={{ borderColor: `${primary}25`, borderRadius: pageTheme.radius, backgroundColor: pageTheme.cardBg }}>
                  {(item.image_url || item.images?.[0]) && (
                    <Image src={(item.image_url || item.images?.[0]) as string} alt={item.title} width={320} height={200} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-5">
                    <p className="text-xs text-gray-400 mb-2 font-mono">{new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <h3 className="font-black text-gray-100 mb-2">{item.title}</h3>
                    {item.body && <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">{item.body}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        {sections.contact && (whatsapp || profile?.contact_phone || profile?.contact_email) && (
          <section data-section="contact" className="dsr-reveal py-14 px-4" style={{ backgroundColor: pageTheme.sectionAlt, order: sectionOrder.contact }}>
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ fontFamily: pageTheme.headingFont }}>{L.contactHeading}</h2>
              <p className="text-sm mb-8 text-gray-400">{L.contactSubtitle}</p>
              <div className="flex flex-col items-center gap-3" dir="ltr">
                {whatsapp && <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90" style={{ backgroundColor: '#25D366' }} dir="ltr"><WaIcon className="w-5 h-5" /> واتساب: {waDisplay}</a>}
                {profile?.contact_phone && <a href={`tel:${profile.contact_phone}`} className="flex items-center gap-2 text-sm font-semibold dsr-text hover:underline" dir="ltr"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {profile.contact_phone}</a>}
                {(profile?.extra_phones ?? []).filter(Boolean).map((n, i) => (
                  <a key={i} href={`tel:${n}`} className="flex items-center gap-2 text-sm font-semibold dsr-text hover:underline" dir="ltr"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {n}</a>
                ))}
                {profile?.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-sm font-semibold dsr-text hover:underline" dir="ltr"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg> {profile.contact_email}</a>}
              </div>
            </div>
          </section>
        )}

        {/* Working Hours */}
        {sections.working_hours && profile?.working_hours && (
          <section data-section="working-hours" className="dsr-reveal py-12 px-4" style={{ backgroundColor: pageTheme.bg, order: sectionOrder.working_hours }}>
            <div className="max-w-xl mx-auto">
              <h3 className="text-2xl font-black text-center mb-6" style={{ fontFamily: pageTheme.headingFont, color: primary }}>{L.workingHoursHeading}</h3>
              <div className="bg-gray-900 rounded-lg p-6 text-sm text-gray-400">
                <WorkingHours hours={profile.working_hours} lang={lang} />
              </div>
            </div>
          </section>
        )}

        {/* Footer — warm dark */}
        {sections.footer && (
          <footer className="py-10 px-6 pb-24 sm:pb-10" style={{ backgroundColor: '#1c0d02', order: sectionOrder.footer }}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-gray-500">
              <div>
                {profile?.logo_url && <Image src={profile.logo_url} alt={tenant.name} width={56} height={56} className="w-14 h-14 object-contain rounded-full mb-3 opacity-80" />}
                <h3 className="text-white font-black text-lg mb-1">{tenant.name}</h3>
                {profile?.bio && <p className="text-xs leading-relaxed line-clamp-3">{profile.bio}</p>}
              </div>
              <div>
                <h4 className="text-xs tracking-widest uppercase mb-3" style={{ color: `${primary}70` }}>{L.footerContact}</h4>
                {whatsapp && <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm mb-2 hover:text-white transition-colors"><WaIcon className="w-3.5 h-3.5 shrink-0" /> {waDisplay}</a>}
                {profile?.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-sm mb-2 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg> {profile.contact_email}</a>}
                <div className="mt-4"><SocialLinks profile={profile} waLink={waLink} /></div>
              </div>
            </div>
            <div className="mt-8 border-t pt-6 text-center text-xs text-gray-700" style={{ borderColor: `${primary}20` }}>
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
            businessType={tenant.business_type}
          />
        )}
      </div>
    </>
  )
}
