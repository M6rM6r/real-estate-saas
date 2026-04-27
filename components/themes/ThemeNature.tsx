'use client'

/**
 * Nature Theme Layout
 * ─────────────────────────────────────────────────────────────
 * - Hero: centered large rounded card on green gradient
 * - Stats row: 3 big number badges below hero
 * - Listings: 3-column organic rounded cards
 * - About + Contact: side-by-side 2-column layout
 * - News: 3-column grid (not horizontal scroll)
 * - Footer: green bg with soft rounded top
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

export default function ThemeNature({ tenant, profile, listings, news, gallery: _gallery, team: _team }: ThemePageProps) {
  const primary = tenant.primary_color ?? '#16a34a'
  const pageTheme = PAGE_THEMES['nature'] ?? PAGE_THEMES.modern
  const pageConfig = getPageConfig(profile)
  const sections = getPageSections(profile)
  const waLink = buildWaLink(tenant, profile)
  const btnRadius = getBtnRadius(pageConfig.button_shape, pageTheme.radius)
  const currency = pageConfig.currency ?? 'SAR'

  const [activeListing, setActiveListing] = useState<Post | null>(null)
  const [offerFilter, setOfferFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [scrolled, setScrolled] = useState(false)

  const hasBanner = !!pageConfig.announcement_text
  const whatsapp = profile?.social_links?.whatsapp
  const waDisplay = whatsapp ? whatsapp.replace(/^https?:\/\/wa\.me\//, '+').replace(/^https?:\/\/api\.whatsapp\.com\/send\?phone=/, '+') : ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('nat-revealed') }),
      { threshold: 0.07 }
    )
    document.querySelectorAll('.nat-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [listings, news])

  const published = listings.filter(l => l.published !== false)
  const propertyTypes = Array.from(new Set(published.map(l => l.property_type).filter(Boolean))) as string[]
  const filtered = published
    .filter(l => offerFilter === 'all' || l.offer_type === offerFilter)
    .filter(l => typeFilter === 'all' || l.property_type === typeFilter)

  const availableCount = published.filter(l => l.listing_status === 'available').length
  const forSaleCount = published.filter(l => l.offer_type === 'sale').length
  const forRentCount = published.filter(l => l.offer_type === 'rent').length

  const cardStyle = {
    backgroundColor: '#fff',
    borderColor: `${primary}25`,
    borderRadius: pageTheme.radius,
    boxShadow: `0 4px 24px ${primary}18`,
  }

  return (
    <>
      <style>{`
        :root { --nat-primary: ${primary}; }
        .nat-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .nat-revealed { opacity: 1; transform: translateY(0); }
        .nat-btn { background: var(--nat-primary); }
        .nat-text { color: var(--nat-primary); }
        .nat-chip-active { background: var(--nat-primary); color: #fff; border-color: var(--nat-primary); }
      `}</style>

      <div className="min-h-screen" dir="rtl" style={{ backgroundColor: pageTheme.bg, color: '#1a2e1a' }}>

        {/* Announcement */}
        {hasBanner && (
          <div className="w-full text-center py-2 px-4 text-xs font-medium" style={{ backgroundColor: primary, color: '#fff' }}>
            🌿 {pageConfig.announcement_text}
          </div>
        )}

        {/* Navbar */}
        <nav className={`fixed inset-x-0 z-40 transition-all duration-300 ${hasBanner ? 'top-8' : 'top-0'} ${scrolled ? 'shadow-md border-b' : 'bg-transparent'}`}
          style={scrolled ? { backgroundColor: '#f0fdf4', borderColor: `${primary}30` } : undefined}>
          <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {profile?.logo_url ? (
                <Image src={profile.logo_url} alt={tenant.name} width={40} height={40} className="w-9 h-9 rounded-full object-cover" style={{ border: `2px solid ${primary}40` }} />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: primary }}>
                  {tenant.name.charAt(0)}
                </div>
              )}
              <span className="font-bold text-sm sm:text-base" style={{ color: scrolled ? '#1a2e1a' : 'white' }}>{tenant.name}</span>
            </div>

          </div>
        </nav>

        {/* Hero */}
        {sections.hero && (
          <section className={`relative flex items-center justify-center overflow-hidden ${hasBanner ? 'pt-24 sm:pt-28' : 'pt-20 sm:pt-24'} pb-20`}
            style={{ background: `linear-gradient(160deg, ${primary}22 0%, ${primary}08 50%, #f0fdf4 100%)` }}>
            {profile?.cover_url && (
              <>
                <Image src={profile.cover_url} alt={tenant.name} fill className="object-cover" priority />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${primary}cc, ${primary}88)` }} />
              </>
            )}
            <div className="relative z-10 text-center px-4 max-w-2xl mx-auto w-full">
              <div className="border px-8 py-10 shadow-2xl mx-auto"
                style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderColor: `${primary}30`, borderRadius: '32px', backdropFilter: 'blur(12px)' }}>
                {profile?.logo_url && (
                  <Image src={profile.logo_url} alt={tenant.name} width={88} height={88} className="w-20 h-20 object-contain mx-auto mb-5 rounded-full shadow-md" style={{ border: `3px solid ${primary}40` }} priority />
                )}
                <h1 className="text-3xl sm:text-5xl font-bold mb-3 text-gray-800 leading-tight" style={{ fontFamily: pageTheme.headingFont }}>
                  {tenant.name}
                </h1>
                {profile?.tagline && <p className="nat-text text-lg font-semibold mb-3">{profile.tagline}</p>}
                <p className="text-gray-500 text-sm sm:text-base mb-7 max-w-sm mx-auto">{pageConfig.hero_headline}</p>

              </div>
            </div>
          </section>
        )}

        {/* Stats row */}
        {published.length > 0 && (
          <section className="nat-reveal py-10 px-4" style={{ backgroundColor: '#f0fdf4' }}>
            <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
              {[
                { label: 'إجمالي العقارات', value: published.length, icon: '🏠' },
                { label: 'للبيع', value: forSaleCount, icon: '🔑' },
                { label: 'للإيجار', value: forRentCount, icon: '📋' },
              ].map(stat => (
                <div key={stat.label} className="text-center py-6 px-4 border" style={{ borderColor: `${primary}30`, borderRadius: '24px', backgroundColor: '#fff', boxShadow: `0 2px 16px ${primary}12` }}>
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl sm:text-4xl font-bold nat-text">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Listings */}
        {sections.listings && published.length > 0 && (
          <section className="nat-reveal py-14 px-4 md:px-8 max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ fontFamily: pageTheme.headingFont, color: '#1a2e1a' }}>العقارات المتاحة</h2>
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-3 -mx-4 px-4 sm:mx-0 sm:px-0" style={{scrollbarWidth:'none'}}>
              {(['all', 'sale', 'rent'] as const).map(f => (
                <button key={f} type="button" onClick={() => setOfferFilter(f)}
                  className={`shrink-0 px-4 py-2 text-sm font-medium border transition-all active:scale-95 ${offerFilter === f ? 'nat-chip-active' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}
                  style={{ borderRadius: '999px' }}>
                  {f === 'all' ? 'الكل' : f === 'sale' ? 'للبيع' : 'للإيجار'}
                </button>
              ))}
            </div>
            {propertyTypes.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0" style={{scrollbarWidth:'none'}}>
                {(['all', ...propertyTypes]).map(f => (
                  <button key={f} type="button" onClick={() => setTypeFilter(f)}
                    className={`shrink-0 px-3 py-1.5 text-xs font-medium border transition-all active:scale-95 ${typeFilter === f ? 'nat-chip-active' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}
                    style={{ borderRadius: '999px' }}>
                    {f === 'all' ? 'كل الأنواع' : f}
                  </button>
                ))}
              </div>
            )}
            {filtered.length === 0 ? (
              <p className="text-center py-12 text-gray-400">لا توجد عقارات لهذا التصنيف</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(l => (
                  <PropertyCard key={l.id} listing={l} onClick={() => setActiveListing(l)} cardStyle={cardStyle} surfaceClass="text-gray-900" mutedClass="text-gray-500" primary={primary} sectionAlt="#f0fdf4" currency={currency} showRealEstateFields={!tenant.business_type || tenant.business_type === 'real_estate'} offerLabel1={pageConfig.offer_label_1} offerLabel2={pageConfig.offer_label_2} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* News — 3 column grid */}
        {sections.news && news.length > 0 && (
          <section className="nat-reveal py-14 px-4 md:px-8" style={{ backgroundColor: '#f0fdf4' }}>
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ fontFamily: pageTheme.headingFont, color: '#1a2e1a' }}>آخر الأخبار</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map(item => (
                  <div key={item.id} className="overflow-hidden border bg-white" style={{ borderColor: `${primary}25`, borderRadius: '24px', boxShadow: `0 2px 16px ${primary}10` }}>
                    {(item.image_url || item.images?.[0]) && (
                      <Image src={(item.image_url || item.images?.[0]) as string} alt={item.title} width={400} height={200} className="w-full h-44 object-cover" />
                    )}
                    <div className="p-5">
                      <p className="text-xs text-gray-400 mb-2">{new Date(item.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                      {item.body && <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{item.body}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About + Contact — side by side */}
        <section className="nat-reveal py-14 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* About */}
            {sections.about && (
              <div className="p-8 border" style={{ borderColor: `${primary}25`, borderRadius: '28px', backgroundColor: '#fff', boxShadow: `0 2px 20px ${primary}10` }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-5 shadow-sm" style={{ backgroundColor: `${primary}18` }}>🌿</div>
                <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: pageTheme.headingFont, color: '#1a2e1a' }}>من نحن</h2>
                {profile?.bio && <p className="text-gray-600 leading-relaxed mb-4">{profile.bio}</p>}
                {profile?.licence_no && <p className="text-xs text-gray-400 font-mono mt-4">رقم الترخيص: {profile.licence_no}</p>}
                {profile?.contact_address && <p className="flex items-center gap-2 text-sm text-gray-500 mt-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> {profile.contact_address}</p>}
                {(profile?.contact_phone || profile?.contact_email) && (
                  <div className="mt-3 space-y-1">
                    {profile.contact_phone && <a href={`tel:${profile.contact_phone}`} className="flex items-center gap-2 text-sm nat-text font-medium hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {profile.contact_phone}</a>}
                    {profile.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-sm nat-text font-medium hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg> {profile.contact_email}</a>}
                  </div>
                )}
                <div className="mt-5"><SocialLinks profile={profile} waLink={waLink} /></div>
                {profile?.working_hours && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">ساعات العمل</p>
                    <WorkingHours hours={profile.working_hours} textClass="text-gray-600" />
                  </div>
                )}
              </div>
            )}
            {/* Contact */}
            {(whatsapp || profile?.contact_phone || profile?.contact_email) && (
              <div className="p-8 border flex flex-col items-center text-center" style={{ borderColor: `${primary}25`, borderRadius: '28px', backgroundColor: '#fff', boxShadow: `0 2px 20px ${primary}10` }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5 shadow-sm" style={{ backgroundColor: `${primary}18` }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" style={{ color: primary }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/></svg></div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: pageTheme.headingFont, color: '#1a2e1a' }}>تواصل معنا</h2>
                <p className="text-sm text-gray-400 mb-6">نسعد بخدمتك — تواصل معنا مباشرةً</p>
                <div className="flex flex-col items-center gap-3 w-full">
                  {whatsapp && <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm w-full justify-center transition-opacity hover:opacity-90" style={{ backgroundColor: '#25D366' }}><WaIcon className="w-5 h-5" /> واتساب: {waDisplay}</a>}
                  {profile?.contact_phone && <a href={`tel:${profile.contact_phone}`} className="flex items-center gap-2 text-sm nat-text font-medium hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {profile.contact_phone}</a>}
                  {profile?.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-sm nat-text font-medium hover:underline"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg> {profile.contact_email}</a>}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        {sections.footer && (
          <footer className="py-10 px-6 pb-24 sm:pb-10" style={{ backgroundColor: primary }}>
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {profile?.logo_url && <Image src={profile.logo_url} alt={tenant.name} width={40} height={40} className="w-10 h-10 rounded-full object-contain bg-white p-1" />}
                <span className="font-bold text-white text-lg">{tenant.name}</span>
              </div>
              <p className="text-white/70 text-sm">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
              <SocialLinks profile={profile} waLink={waLink} bgClass="bg-white/20 hover:bg-white/40" />
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
