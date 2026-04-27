'use client'

/**
 * Luxury Theme Layout
 * ─────────────────────────────────────────────────────────────
 * - Full-bleed hero: huge serif title directly on image, NO frosted card
 * - Gold horizontal line separator
 * - First listing shown as full-width "featured" banner
 * - Remaining listings in a 2-column grid with gold-bordered cards
 * - News as a typography-first stacked list (title + date + excerpt)
 * - About: large italic centered quote, no card
 * - Contact: minimal — just links + WhatsApp button
 * - Footer: single slim row (logo + copyright + socials)
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
  SocialLinks, WorkingHours, WaIcon, ListingBadges, DAY_LABELS_AR,
} from './shared'

export default function ThemeLuxury({ tenant, profile, listings, news, gallery: _gallery, team: _team }: ThemePageProps) {
  const primary = tenant.primary_color ?? '#c9a84c'
  const pageTheme = PAGE_THEMES['luxury'] ?? PAGE_THEMES.modern
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
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('lux-revealed') }),
      { threshold: 0.06 }
    )
    document.querySelectorAll('.lux-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [listings, news])

  const published = listings.filter(l => l.published !== false)
  const filtered = offerFilter === 'all' ? published : published.filter(l => l.offer_type === offerFilter)
  const featured = filtered[0] ?? null
  const rest = filtered.slice(1)

  return (
    <>
      <style>{`
        :root { --lux-gold: ${primary}; }
        .lux-reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .lux-revealed { opacity: 1; transform: translateY(0); }
        .lux-gold { color: var(--lux-gold); }
        .lux-border { border-color: var(--lux-gold) !important; }
      `}</style>

      <div className="min-h-screen" dir="rtl" style={{ backgroundColor: pageTheme.bg, color: '#e8e0d0' }}>

        {/* Announcement */}
        {hasBanner && (
          <div className="w-full text-center py-2 px-4 text-xs tracking-widest uppercase" style={{ backgroundColor: primary, color: '#0a0a0a' }}>
            {pageConfig.announcement_text}
          </div>
        )}

        {/* Sticky minimal nav */}
        <nav className={`fixed inset-x-0 z-40 transition-all duration-500 ${hasBanner ? 'top-8' : 'top-0'} ${scrolled ? 'bg-black/90 backdrop-blur border-b border-yellow-900/30' : 'bg-transparent'}`}>
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile?.logo_url ? (
                <Image src={profile.logo_url} alt={tenant.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: primary, color: '#0a0a0a' }}>
                  {tenant.name.charAt(0)}
                </div>
              )}
              <span className="font-light tracking-widest text-sm uppercase text-white/90">{tenant.name}</span>
            </div>

          </div>
        </nav>

        {/* Hero — full bleed, no card */}
        {sections.hero && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {profile?.cover_url ? (
              <Image src={profile.cover_url} alt={tenant.name} fill className="object-cover scale-105" priority />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #0a0a0a 0%, #1a1209 100%)` }} />
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 100%)' }} />
            <div className={`relative z-10 text-center px-6 max-w-4xl mx-auto ${hasBanner ? 'pt-24' : 'pt-16'}`}>
              {profile?.logo_url && (
                <Image src={profile.logo_url} alt={tenant.name} width={80} height={80} className="w-16 h-16 object-contain mx-auto mb-8 opacity-90" priority />
              )}
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-6 leading-none tracking-tight text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                {tenant.name}
              </h1>
              <div className="w-24 h-px mx-auto mb-6" style={{ backgroundColor: primary }} />
              {profile?.tagline && (
                <p className="text-lg sm:text-2xl font-light tracking-widest mb-8" style={{ color: primary }}>
                  {profile.tagline}
                </p>
              )}
              <p className="text-base sm:text-lg text-white/70 mb-10 max-w-xl mx-auto font-light leading-relaxed">
                {pageConfig.hero_headline}
              </p>

            </div>
            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
              <div className="w-px h-10 animate-pulse" style={{ backgroundColor: primary }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: primary }}>اكتشف</span>
            </div>
          </section>
        )}

        {/* Gold divider + tagline strip */}
        <div className="py-10 px-6 text-center" style={{ backgroundColor: '#0d0d0d' }}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px" style={{ backgroundColor: `${primary}40` }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
              <div className="flex-1 h-px" style={{ backgroundColor: `${primary}40` }} />
            </div>
            <p className="text-sm tracking-[0.3em] uppercase font-light" style={{ color: `${primary}cc` }}>
              {profile?.bio ? profile.bio.slice(0, 120) + (profile.bio.length > 120 ? '...' : '') : 'الخبرة والفخامة في كل تفصيل'}
            </p>
          </div>
        </div>

        {/* Listings */}
        {sections.listings && published.length > 0 && (
          <section className="lux-reveal py-16 px-6 md:px-12" style={{ backgroundColor: pageTheme.bg }}>
            <div className="max-w-6xl mx-auto">
              <div className="flex items-baseline justify-between mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: '#e8e0d0' }}>
                  العقارات المتاحة
                </h2>
                {/* Offer filter */}
                <div className="flex gap-3">
                  {(['all', 'sale', 'rent'] as const).map(f => (
                    <button key={f} type="button" onClick={() => setOfferFilter(f)}
                      className="text-xs tracking-widest uppercase px-4 py-1.5 border transition-all"
                      style={offerFilter === f
                        ? { backgroundColor: primary, borderColor: primary, color: '#0a0a0a', borderRadius: btnRadius }
                        : { borderColor: `${primary}40`, color: `${primary}99`, borderRadius: btnRadius }}>
                      {f === 'all' ? 'الكل' : f === 'sale' ? 'بيع' : 'إيجار'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured listing */}
              {featured && (
                <button className="w-full text-right border overflow-hidden mb-8 group transition-all hover:border-opacity-100 block"
                  style={{ borderColor: `${primary}40`, borderRadius: pageTheme.radius }}
                  onClick={() => setActiveListing(featured)}>
                  <div className="flex flex-col lg:flex-row">
                    <div className="relative lg:w-1/2 h-64 lg:h-80">
                      {featured.images[0] ? (
                        <Image src={featured.images[0]} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: '#141414' }} />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <ListingBadges listing={featured} primary={primary} offerLabel1={pageConfig.offer_label_1} offerLabel2={pageConfig.offer_label_2} />
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-center" style={{ backgroundColor: '#111' }}>
                      <span className="text-xs tracking-widest uppercase mb-3" style={{ color: primary }}>مميز</span>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: '#e8e0d0' }}>
                        {featured.title}
                      </h3>
                      {featured.price != null && (
                        <p className="text-2xl font-bold mb-4" style={{ color: primary }}>
                          {featured.price.toLocaleString('ar-SA')} {CURRENCY_SYMBOLS[currency] ?? currency}
                        </p>
                      )}
                      {featured.location && <p className="text-sm text-gray-500 mb-4">📍 {featured.location}</p>}
                      <div className="flex gap-4 text-sm text-gray-500">
                        {featured.bedrooms != null && <span>🛏 {featured.bedrooms} غرفة</span>}
                        {featured.bathrooms != null && <span>🚿 {featured.bathrooms} حمام</span>}
                        {featured.area_sqm != null && <span>📐 {featured.area_sqm} م²</span>}
                      </div>
                      <div className="mt-6">
                        <span className="inline-block px-5 py-2 text-xs tracking-widest uppercase border transition-all"
                          style={{ borderColor: primary, color: primary, borderRadius: btnRadius }}>
                          عرض التفاصيل
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {/* Remaining listings — 2 column */}
              {rest.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-6">
                  {rest.map(l => (
                    <button key={l.id} className="text-right border overflow-hidden group transition-all hover:border-opacity-100 block"
                      style={{ borderColor: `${primary}30`, borderRadius: pageTheme.radius, backgroundColor: '#111' }}
                      onClick={() => setActiveListing(l)}>
                      <div className="relative h-52">
                        {l.images[0] ? (
                          <Image src={l.images[0]} alt={l.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full" style={{ backgroundColor: '#1a1a1a' }} />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                        <ListingBadges listing={l} primary={primary} offerLabel1={pageConfig.offer_label_1} offerLabel2={pageConfig.offer_label_2} />
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold mb-2 text-gray-200">{l.title}</h3>
                        {l.price != null && <p className="font-bold text-lg mb-1" style={{ color: primary }}>{l.price.toLocaleString('ar-SA')} {CURRENCY_SYMBOLS[currency] ?? currency}</p>}
                        {l.location && <p className="text-xs text-gray-600 mb-3">📍 {l.location}</p>}
                        <div className="flex gap-3 text-xs text-gray-600">
                          {l.bedrooms != null && <span>🛏 {l.bedrooms}</span>}
                          {l.bathrooms != null && <span>🚿 {l.bathrooms}</span>}
                          {l.area_sqm != null && <span>📐 {l.area_sqm} م²</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* News — typography list */}
        {sections.news && news.length > 0 && (
          <section className="lux-reveal py-16 px-6 md:px-12" style={{ backgroundColor: '#0d0d0d' }}>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-10">
                <div className="flex-1 h-px" style={{ backgroundColor: `${primary}30` }} />
                <h2 className="text-2xl font-bold tracking-widest uppercase" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: primary }}>آخر الأخبار</h2>
                <div className="flex-1 h-px" style={{ backgroundColor: `${primary}30` }} />
              </div>
              <div className="space-y-8">
                {news.map((item, idx) => (
                  <div key={item.id} className="flex gap-6 items-start border-b pb-8" style={{ borderColor: `${primary}18` }}>
                    <span className="text-4xl font-bold opacity-20 shrink-0 leading-none" style={{ color: primary }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-xs tracking-widest uppercase mb-2 text-gray-600">
                        {new Date(item.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <h3 className="text-lg font-semibold mb-2 text-gray-200">{item.title}</h3>
                      {item.body && <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{item.body}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About — quote style */}
        {sections.about && profile?.bio && (
          <section className="lux-reveal py-20 px-6 text-center" style={{ backgroundColor: pageTheme.bg }}>
            <div className="max-w-2xl mx-auto">
              <div className="w-12 h-px mx-auto mb-8" style={{ backgroundColor: primary }} />
              <p className="text-xl sm:text-2xl font-light italic leading-relaxed text-gray-300" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                &ldquo;{profile.bio}&rdquo;
              </p>
              {profile.licence_no && (
                <p className="mt-8 text-xs tracking-widest uppercase text-gray-600 font-mono">
                  رقم الترخيص: {profile.licence_no}
                </p>
              )}
              <div className="w-12 h-px mx-auto mt-8" style={{ backgroundColor: primary }} />
            </div>
          </section>
        )}

        {/* Contact — minimal */}
        <section className="lux-reveal py-16 px-6" style={{ backgroundColor: '#0d0d0d' }}>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold tracking-widest uppercase mb-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: primary }}>
              تواصل معنا
            </h2>
            <div className="w-12 h-px mx-auto mb-8" style={{ backgroundColor: `${primary}60` }} />
            <div className="space-y-3">
              {whatsapp && <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 text-sm text-gray-400 hover:text-white transition-colors"><WaIcon className="w-4 h-4 shrink-0" /> {waDisplay}</a>}
              {profile?.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg> {profile.contact_email}</a>}
              {profile?.contact_phone && <a href={`tel:${profile.contact_phone}`} className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg> {profile.contact_phone}</a>}
              {profile?.contact_address && <p className="flex items-center justify-center gap-2 text-sm text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd"/></svg> {profile.contact_address}</p>}
            </div>
          </div>
        </section>

        {/* Footer — slim single row */}
        {sections.footer && (
          <footer className="py-6 px-6 border-t" style={{ backgroundColor: '#0a0a0a', borderColor: `${primary}20` }}>
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
              <span className="tracking-widest uppercase">{tenant.name} © {new Date().getFullYear()}</span>
              <SocialLinks profile={profile} waLink={waLink} />
              {profile?.working_hours && (
                <details className="text-right">
                  <summary className="cursor-pointer tracking-widest uppercase hover:text-gray-400 transition-colors" style={{ color: `${primary}80` }}>ساعات العمل</summary>
                  <div className="mt-2 p-3 border absolute bottom-16 left-4" style={{ backgroundColor: '#141414', borderColor: `${primary}30`, borderRadius: '4px' }}>
                    <WorkingHours hours={profile.working_hours} />
                  </div>
                </details>
              )}
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
