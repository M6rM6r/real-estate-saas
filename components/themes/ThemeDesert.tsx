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
  getPageConfig, getPageSections, buildWaLink, getBtnRadius,
  SocialLinks, WorkingHours, WaIcon, ListingBadges, PropertyCard, DAY_LABELS_AR,
} from './shared'

export default function ThemeDesert({ tenant, profile, listings, news, gallery: _gallery, team: _team }: ThemePageProps) {
  const primary = tenant.primary_color ?? '#d97706'
  const pageTheme = PAGE_THEMES['desert'] ?? PAGE_THEMES.modern
  const pageConfig = getPageConfig(profile)
  const sections = getPageSections(profile)
  const waLink = buildWaLink(tenant, profile)
  const btnRadius = getBtnRadius(pageConfig.button_shape, pageTheme.radius)
  const currency = pageConfig.currency ?? 'SAR'

  const [activeListing, setActiveListing] = useState<Post | null>(null)
  const [offerFilter, setOfferFilter] = useState('all')
  const [scrolled, setScrolled] = useState(false)

  const hasBanner = !!pageConfig.announcement_text
  const whatsapp = profile?.social_links?.whatsapp
  const waDisplay = whatsapp ? whatsapp.replace(/^https?:\/\/wa\.me\//, '+').replace(/^https?:\/\/api\.whatsapp\.com\/send\?phone=/, '+') : ''

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
  const filtered = offerFilter === 'all' ? published : published.filter(l => l.offer_type === offerFilter)
  const featured = filtered[0] ?? null
  const compact = filtered.slice(1)

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

      <div className="min-h-screen" dir="rtl" style={{ backgroundColor: pageTheme.bg, color: '#2d1a0a' }}>

        {/* Announcement */}
        {hasBanner && (
          <div className="w-full text-center py-2 px-4 text-xs font-semibold tracking-widest uppercase" style={{ backgroundColor: primary, color: '#fff' }}>
            {pageConfig.announcement_text}
          </div>
        )}

        {/* Navbar — minimal */}
        <nav className={`fixed inset-x-0 z-40 transition-all duration-400 ${hasBanner ? 'top-8' : 'top-0'} ${scrolled ? 'shadow border-b' : 'bg-transparent'}`}
          style={scrolled ? { backgroundColor: '#fefce8', borderColor: `${primary}30` } : undefined}>
          <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile?.logo_url ? (
                <Image src={profile.logo_url} alt={tenant.name} width={40} height={40} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: primary }}>
                  {tenant.name.charAt(0)}
                </div>
              )}
              <span className="font-black text-sm sm:text-base tracking-wide" style={{ color: scrolled ? '#2d1a0a' : 'white', textShadow: scrolled ? 'none' : '0 1px 4px rgba(0,0,0,0.5)' }}>
                {tenant.name}
              </span>
            </div>

          </div>
        </nav>

        {/* Hero — no card, HUGE text */}
        {sections.hero && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {profile?.cover_url ? (
              <Image src={profile.cover_url} alt={tenant.name} fill className="object-cover" priority />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, #3d1f04 0%, #7c3a0c 60%, ${primary} 100%)` }} />
            )}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, rgba(45,26,10,0.75) 0%, rgba(217,119,6,0.45) 100%)` }} />
            <div className={`relative z-10 text-center text-white px-6 max-w-5xl mx-auto w-full ${hasBanner ? 'pt-24' : 'pt-20'}`}>
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
              <p className="text-white/70 text-base sm:text-xl mb-10 max-w-2xl mx-auto font-light">
                {pageConfig.hero_headline}
              </p>

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
        {sections.listings && featured && (
          <section className="dsr-reveal py-14 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-black" style={{ fontFamily: pageTheme.headingFont }}>العقارات المتاحة</h2>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0" style={{scrollbarWidth:'none'}}>
                {(['all', 'sale', 'rent'] as const).map(f => (
                  <button key={f} type="button" onClick={() => setOfferFilter(f)}
                    className={`shrink-0 px-3 py-1.5 text-xs font-bold border transition-all active:scale-95 ${offerFilter === f ? 'dsr-chip-active' : 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'}`}
                    style={{ borderRadius: btnRadius }}>
                    {f === 'all' ? 'الكل' : f === 'sale' ? 'بيع' : 'إيجار'}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured */}
            <button className="w-full text-right border overflow-hidden mb-8 group block hover:shadow-xl transition-all"
              style={{ borderColor: `${primary}50`, borderRadius: pageTheme.radius, backgroundColor: pageTheme.cardBg }}
              onClick={() => setActiveListing(featured)}>
              <div className="flex flex-col md:flex-row">
                {/* Image on right for RTL */}
                <div className="relative h-60 md:h-80 md:w-1/2 order-last md:order-last">
                  {featured.images[0] ? (
                    <Image src={featured.images[0]} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: '#f5e6c8' }} />
                  )}
                  <ListingBadges listing={featured} primary={primary} offerLabel1={pageConfig.offer_label_1} offerLabel2={pageConfig.offer_label_2} />
                </div>
                {/* Details on left */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
                  <span className="text-xs font-bold tracking-widest uppercase mb-3 dsr-text">عقار مميز</span>
                  <h3 className="text-2xl sm:text-3xl font-black mb-3" style={{ fontFamily: pageTheme.headingFont }}>{featured.title}</h3>
                  {featured.price != null && (
                    <p className="text-2xl font-black dsr-text mb-3">
                      {featured.price.toLocaleString('ar-SA')} {CURRENCY_SYMBOLS[currency] ?? currency}
                    </p>
                  )}
                  {featured.location && <p className="text-sm text-gray-500 mb-4">📍 {featured.location}</p>}
                  <div className="flex gap-4 text-sm text-gray-500 mb-5">
                    {featured.bedrooms != null && <span>🛏 {featured.bedrooms} غرفة</span>}
                    {featured.bathrooms != null && <span>🚿 {featured.bathrooms} حمام</span>}
                    {featured.area_sqm != null && <span>📐 {featured.area_sqm} م²</span>}
                  </div>
                  <span className="dsr-btn text-white px-6 py-2.5 text-sm font-bold inline-block w-fit"
                    style={{ borderRadius: btnRadius }}>
                    عرض التفاصيل
                  </span>
                </div>
              </div>
            </button>

            {/* Remaining — 4 col compact */}
            {compact.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                      <ListingBadges listing={l} primary={primary} offerLabel1={pageConfig.offer_label_1} offerLabel2={pageConfig.offer_label_2} />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold mb-1 line-clamp-1 text-gray-800">{l.title}</h3>
                      {l.price != null && <p className="text-sm font-black dsr-text">{l.price.toLocaleString('ar-SA')}</p>}
                      {l.location && <p className="text-xs text-gray-400 mt-1 line-clamp-1">📍 {l.location}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* About — warm card */}
        {sections.about && (
          <section className="dsr-reveal py-12 px-4 md:px-8" style={{ backgroundColor: '#fef9f0' }}>
            <div className="max-w-5xl mx-auto">
              <div className="border p-8 sm:p-10" style={{ borderColor: `${primary}30`, borderRadius: pageTheme.radius, backgroundColor: '#fff' }}>
                <div className="flex flex-col sm:flex-row items-start gap-8">
                  {profile?.logo_url && (
                    <Image src={profile.logo_url} alt={tenant.name} width={96} height={96} className="w-24 h-24 rounded-full object-contain shadow border shrink-0" style={{ borderColor: `${primary}40` }} />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ fontFamily: pageTheme.headingFont }}>من نحن</h2>
                    {profile?.bio && <p className="text-gray-600 leading-relaxed mb-4">{profile.bio}</p>}
                    <div className="flex flex-wrap gap-3">
                      {profile?.licence_no && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: `${primary}18`, color: primary }}>
                          🏛 رقم الترخيص: {profile.licence_no}
                        </span>
                      )}
                      {profile?.contact_address && (
                        <span className="text-xs text-gray-500 flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 shrink-0"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> {profile.contact_address}</span>
                      )}
                    </div>
                    {(profile?.contact_phone || profile?.contact_email) && (
                      <div className="mt-4 flex flex-wrap gap-4">
                        {profile.contact_phone && <a href={`tel:${profile.contact_phone}`} className="flex items-center gap-2 text-sm font-semibold dsr-text hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {profile.contact_phone}</a>}
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
          <section className="dsr-reveal py-14 px-4 md:px-8 max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-8" style={{ fontFamily: pageTheme.headingFont }}>آخر الأخبار</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
              {news.map(item => (
                <div key={item.id} className="shrink-0 snap-start w-72 sm:w-80 overflow-hidden border" style={{ borderColor: `${primary}25`, borderRadius: pageTheme.radius, backgroundColor: pageTheme.cardBg }}>
                  {(item.image_url || item.images?.[0]) && (
                    <Image src={(item.image_url || item.images?.[0]) as string} alt={item.title} width={320} height={200} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-5">
                    <p className="text-xs text-gray-400 mb-2 font-mono">{new Date(item.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <h3 className="font-black text-gray-800 mb-2">{item.title}</h3>
                    {item.body && <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{item.body}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        {(whatsapp || profile?.contact_phone || profile?.contact_email) && (
          <section className="dsr-reveal py-14 px-4" style={{ backgroundColor: '#fef9f0' }}>
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ fontFamily: pageTheme.headingFont }}>تواصل معنا</h2>
              <p className="text-sm mb-8 text-gray-400">نرحب بتواصلك — تواصل معنا عبر:</p>
              <div className="flex flex-col items-center gap-3">
                {whatsapp && <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90" style={{ backgroundColor: '#25D366' }}><WaIcon className="w-5 h-5" /> واتساب: {waDisplay}</a>}
                {profile?.contact_phone && <a href={`tel:${profile.contact_phone}`} className="flex items-center gap-2 text-sm font-semibold dsr-text hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {profile.contact_phone}</a>}
                {profile?.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-sm font-semibold dsr-text hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg> {profile.contact_email}</a>}
              </div>
            </div>
          </section>
        )}

        {/* Footer — warm dark */}
        {sections.footer && (
          <footer className="py-10 px-6 pb-24 sm:pb-10" style={{ backgroundColor: '#1c0d02' }}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-gray-500">
              <div>
                {profile?.logo_url && <Image src={profile.logo_url} alt={tenant.name} width={56} height={56} className="w-14 h-14 object-contain rounded-full mb-3 opacity-80" />}
                <h3 className="text-white font-black text-lg mb-1">{tenant.name}</h3>
                {profile?.bio && <p className="text-xs leading-relaxed line-clamp-3">{profile.bio}</p>}
              </div>
              <div>
                <h4 className="text-xs tracking-widest uppercase mb-3" style={{ color: `${primary}70` }}>التواصل</h4>
                {whatsapp && <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm mb-2 hover:text-white transition-colors"><WaIcon className="w-3.5 h-3.5 shrink-0" /> {waDisplay}</a>}
                {profile?.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-sm mb-2 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg> {profile.contact_email}</a>}
                {profile?.contact_phone && <a href={`tel:${profile.contact_phone}`} className="flex items-center gap-2 text-sm mb-2 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {profile.contact_phone}</a>}
                <div className="mt-4"><SocialLinks profile={profile} waLink={waLink} /></div>
              </div>
              {profile?.working_hours && (
                <div>
                  <h4 className="text-xs tracking-widest uppercase mb-3" style={{ color: `${primary}70` }}>ساعات العمل</h4>
                  <WorkingHours hours={profile.working_hours} />
                </div>
              )}
            </div>
            <div className="mt-8 border-t pt-6 text-center text-xs text-gray-700" style={{ borderColor: `${primary}20` }}>
              جميع الحقوق محفوظة © {new Date().getFullYear()} {tenant.name}
            </div>
          </footer>
        )}

        <FloatContactButtons whatsapp={profile?.social_links?.whatsapp} accentColor={primary} />
        {activeListing && (
          <PropertyDetailModal
            property={activeListing as Parameters<typeof PropertyDetailModal>[0]['property']}
            onClose={() => setActiveListing(null)}
            slug={tenant.slug}
            tenantId={tenant.id}
            accentColor={primary}
          />
        )}
      </div>
    </>
  )
}
