'use client'

/**
 * Ocean Theme Layout
 * ─────────────────────────────────────────────────────────────
 * - Hero: full-screen cover image with SVG wave cut at bottom
 * - Feature strip: horizontal icon+number stat badges
 * - Listings: standard 3-col grid
 * - News: 2 large side-by-side featured image cards
 * - About: centered section
 * - Footer: SVG wave at top, navy bg
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

export default function ThemeOcean({ tenant, profile, listings, news, gallery: _gallery, team: _team }: ThemePageProps) {
  const primary = tenant.primary_color ?? '#0891b2'
  const pageTheme = PAGE_THEMES['ocean'] ?? PAGE_THEMES.modern
  const pageConfig = getPageConfig(profile)
  const sections = getPageSections(profile)
  const waLink = buildWaLink(tenant, profile)
  const btnRadius = getBtnRadius(pageConfig.button_shape, pageTheme.radius)
  const currency = pageConfig.currency ?? 'SAR'

  const [activeListing, setActiveListing] = useState<Post | null>(null)
  const [offerFilter, setOfferFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
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
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('ocn-revealed') }),
      { threshold: 0.07 }
    )
    document.querySelectorAll('.ocn-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [listings, news])

  const published = listings.filter(l => l.published !== false)
  const filtered = published
    .filter(l => offerFilter === 'all' || l.offer_type === offerFilter)
    .filter(l => statusFilter === 'all' || l.listing_status === statusFilter)

  const forSaleCount = published.filter(l => l.offer_type === 'sale').length
  const forRentCount = published.filter(l => l.offer_type === 'rent').length
  const availableCount = published.filter(l => l.listing_status === 'available').length

  const cardStyle = {
    backgroundColor: pageTheme.cardBg,
    borderColor: pageTheme.cardBorder,
    borderRadius: pageTheme.radius,
    boxShadow: pageTheme.cardShadow,
  }

  return (
    <>
      <style>{`
        :root { --ocn-primary: ${primary}; }
        .ocn-reveal { opacity: 0; transform: translateY(22px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .ocn-revealed { opacity: 1; transform: translateY(0); }
        .ocn-btn { background: var(--ocn-primary); }
        .ocn-text { color: var(--ocn-primary); }
        .ocn-chip-active { background: var(--ocn-primary); color: #fff; border-color: var(--ocn-primary); }
      `}</style>

      <div className="min-h-screen" dir="rtl" style={{ backgroundColor: pageTheme.bg, color: '#0c2340' }}>

        {/* Announcement */}
        {hasBanner && (
          <div className="w-full text-center py-2 px-4 text-xs font-medium" style={{ backgroundColor: primary, color: '#fff' }}>
            🌊 {pageConfig.announcement_text}
          </div>
        )}

        {/* Sticky nav */}
        <nav className={`fixed inset-x-0 z-40 transition-all duration-300 ${hasBanner ? 'top-8' : 'top-0'} ${scrolled ? 'shadow-lg border-b' : 'bg-transparent'}`}
          style={scrolled ? { backgroundColor: '#f0f9ff', borderColor: `${primary}30` } : undefined}>
          <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile?.logo_url ? (
                <Image src={profile.logo_url} alt={tenant.name} width={40} height={40} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/40" />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: primary }}>
                  {tenant.name.charAt(0)}
                </div>
              )}
              <span className="font-bold text-sm sm:text-base" style={{ color: scrolled ? '#0c2340' : 'white', textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.4)' }}>
                {tenant.name}
              </span>
            </div>

          </div>
        </nav>

        {/* Hero — full screen with wave */}
        {sections.hero && (
          <section className="relative" style={{ minHeight: '100vh' }}>
            {profile?.cover_url ? (
              <Image src={profile.cover_url} alt={tenant.name} fill className="object-cover" priority />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, #0c2340 0%, ${primary} 100%)` }} />
            )}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(12,35,64,0.6) 0%, rgba(12,35,64,0.8) 100%)` }} />
            <div className={`relative z-10 flex items-center justify-center text-center px-4 text-white ${hasBanner ? 'pt-24' : 'pt-20'}`} style={{ minHeight: '100vh' }}>
              <div className="max-w-2xl">
                {profile?.logo_url && (
                  <Image src={profile.logo_url} alt={tenant.name} width={96} height={96} className="w-20 h-20 object-contain mx-auto mb-6 rounded-full bg-white/10 p-2 backdrop-blur" priority />
                )}
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 leading-tight" style={{ fontFamily: pageTheme.headingFont }}>
                  {tenant.name}
                </h1>
                {profile?.tagline && <p className="text-lg sm:text-2xl font-light mb-4" style={{ color: `${primary}dd` }}>{profile.tagline}</p>}
                <p className="text-white/70 text-base sm:text-lg mb-8 max-w-lg mx-auto leading-relaxed">{pageConfig.hero_headline}</p>

              </div>
            </div>
            {/* Wave SVG */}
            <div className="absolute bottom-0 inset-x-0 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full" style={{ display: 'block', height: '80px' }}>
                <path fill={pageTheme.bg} fillOpacity="1" d="M0,64L60,58.7C120,53,240,43,360,48C480,53,600,75,720,80C840,85,960,75,1080,64C1200,53,1320,43,1380,37.3L1440,32L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" />
              </svg>
            </div>
          </section>
        )}

        {/* Feature strip */}
        {published.length > 0 && (
          <section className="ocn-reveal py-8 px-4" style={{ backgroundColor: pageTheme.bg }}>
            <div className="max-w-5xl mx-auto">
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {[
                  { icon: '🏠', label: 'إجمالي العقارات', value: published.length },
                  { icon: '🔑', label: 'للبيع', value: forSaleCount },
                  { icon: '📋', label: 'للإيجار', value: forRentCount },
                  { icon: '✅', label: 'متاح الآن', value: availableCount },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3 shrink-0 snap-start px-5 py-4 border"
                    style={{ borderColor: `${primary}30`, borderRadius: pageTheme.radius, backgroundColor: `${primary}08` }}>
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <div className="text-xl font-bold ocn-text">{s.value}</div>
                      <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Listings */}
        {sections.listings && published.length > 0 && (
          <section className="ocn-reveal py-12 px-4 md:px-8 max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ fontFamily: pageTheme.headingFont }}>العقارات المتاحة</h2>
            <div className="flex gap-2 overflow-x-auto pb-1 mb-3 -mx-4 px-4 sm:mx-0 sm:px-0" style={{scrollbarWidth:'none'}}>
              {(['all', 'sale', 'rent'] as const).map(f => (
                <button key={f} type="button" onClick={() => setOfferFilter(f)}
                  className={`shrink-0 px-4 py-2 text-sm font-medium border transition-all active:scale-95 ${offerFilter === f ? 'ocn-chip-active' : 'bg-white text-gray-600 border-gray-200 hover:border-cyan-300'}`}
                  style={{ borderRadius: '999px' }}>
                  {f === 'all' ? 'الكل' : f === 'sale' ? 'للبيع' : 'للإيجار'}
                </button>
              ))}
              {(['all', 'available', 'sold', 'rented'] as const).map(f => (
                <button key={f} type="button" onClick={() => setStatusFilter(f)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-medium border transition-all active:scale-95 ${statusFilter === f ? 'ocn-chip-active' : 'bg-white text-gray-500 border-gray-200 hover:border-cyan-300'}`}
                  style={{ borderRadius: '999px' }}>
                  {f === 'all' ? 'كل الحالات' : STATUS_LABELS[f]}
                </button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <p className="text-center py-12 text-gray-400">لا توجد عقارات لهذا التصنيف</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(l => (
                  <PropertyCard key={l.id} listing={l} onClick={() => setActiveListing(l)} cardStyle={cardStyle} surfaceClass="text-gray-900" mutedClass="text-gray-500" primary={primary} sectionAlt={pageTheme.sectionAlt} currency={currency} showRealEstateFields={!tenant.business_type || tenant.business_type === 'real_estate'} offerLabel1={pageConfig.offer_label_1} offerLabel2={pageConfig.offer_label_2} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* News — 2 large side by side */}
        {sections.news && news.length > 0 && (
          <section className="ocn-reveal py-14 px-4 md:px-8" style={{ backgroundColor: pageTheme.sectionAlt }}>
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ fontFamily: pageTheme.headingFont }}>آخر الأخبار</h2>
              {/* First 2 as large cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {news.slice(0, 2).map(item => (
                  <div key={item.id} className="overflow-hidden border" style={{ borderColor: pageTheme.cardBorder, borderRadius: pageTheme.radius, backgroundColor: pageTheme.cardBg, boxShadow: pageTheme.cardShadow }}>
                    {(item.image_url || item.images?.[0]) && (
                      <Image src={(item.image_url || item.images?.[0]) as string} alt={item.title} width={600} height={300} className="w-full h-56 sm:h-72 object-cover" />
                    )}
                    <div className="p-6">
                      <p className="text-xs text-gray-400 mb-2">{new Date(item.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <h3 className="text-lg font-bold mb-2" style={{ color: '#0c2340' }}>{item.title}</h3>
                      {item.body && <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{item.body}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {/* Rest as horizontal scroll */}
              {news.length > 2 && (
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x -mx-4 px-4">
                  {news.slice(2).map(item => (
                    <div key={item.id} className="shrink-0 snap-start w-64 overflow-hidden border" style={{ borderColor: pageTheme.cardBorder, borderRadius: pageTheme.radius, backgroundColor: pageTheme.cardBg }}>
                      {(item.image_url || item.images?.[0]) && <Image src={(item.image_url || item.images?.[0]) as string} alt={item.title} width={256} height={140} className="w-full h-36 object-cover" />}
                      <div className="p-4">
                        <p className="text-xs text-gray-400 mb-1">{new Date(item.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}</p>
                        <h3 className="text-sm font-semibold line-clamp-2">{item.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* About */}
        {sections.about && (
          <section className="ocn-reveal py-14 px-4 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: pageTheme.headingFont }}>من نحن</h2>
            {profile?.bio && <p className="text-gray-600 leading-relaxed text-base sm:text-lg">{profile.bio}</p>}
            {profile?.licence_no && <p className="mt-4 text-sm font-mono text-gray-400">رقم الترخيص: {profile.licence_no}</p>}
          </section>
        )}

        {/* Contact */}
        {(whatsapp || profile?.contact_phone || profile?.contact_email) && (
          <section className="ocn-reveal py-14 px-4" style={{ backgroundColor: pageTheme.sectionAlt }}>
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: pageTheme.headingFont }}>تواصل معنا</h2>
              <p className="text-sm mb-8 text-gray-400">نسعد بخدمتك — تواصل معنا عبر:</p>
              <div className="flex flex-col items-center gap-3">
                {whatsapp && <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90" style={{ backgroundColor: '#25D366' }}><WaIcon className="w-5 h-5" /> واتساب: {waDisplay}</a>}
                {profile?.contact_phone && <a href={`tel:${profile.contact_phone}`} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {profile.contact_phone}</a>}
                {profile?.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg> {profile.contact_email}</a>}
              </div>
            </div>
          </section>
        )}

        {/* Footer — wave top + navy */}
        {sections.footer && (
          <footer style={{ backgroundColor: '#0c2340' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full" style={{ display: 'block', height: '40px' }}>
              <path fill={pageTheme.sectionAlt} fillOpacity="1" d="M0,32L80,26.7C160,21,320,11,480,16C640,21,800,43,960,48C1120,53,1280,43,1360,37.3L1440,32L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" />
            </svg>
            <div className="px-6 py-10 pb-24 sm:pb-10">
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-gray-400">
                <div>
                  {profile?.logo_url && <Image src={profile.logo_url} alt={tenant.name} width={56} height={56} className="w-14 h-14 object-contain rounded-full bg-white/10 mb-3 p-1" />}
                  <h3 className="text-white font-bold text-lg mb-1">{tenant.name}</h3>
                  {profile?.bio && <p className="text-xs leading-relaxed line-clamp-3">{profile.bio}</p>}
                </div>
                <div>
                  <h4 className="text-white/50 text-xs uppercase tracking-widest mb-3">التواصل</h4>
                  {whatsapp && <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm mb-2 hover:text-white transition-colors"><WaIcon className="w-3.5 h-3.5 shrink-0" /> {waDisplay}</a>}
                  {profile?.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-sm mb-2 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg> {profile.contact_email}</a>}
                  {profile?.contact_phone && <a href={`tel:${profile.contact_phone}`} className="flex items-center gap-2 text-sm mb-2 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {profile.contact_phone}</a>}
                  <div className="mt-4"><SocialLinks profile={profile} waLink={waLink} /></div>
                </div>
                {profile?.working_hours && (
                  <div>
                    <h4 className="text-white/50 text-xs uppercase tracking-widest mb-3">ساعات العمل</h4>
                    <WorkingHours hours={profile.working_hours} />
                  </div>
                )}
              </div>
              <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-gray-600">
                جميع الحقوق محفوظة © {new Date().getFullYear()} {tenant.name}
              </div>
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
