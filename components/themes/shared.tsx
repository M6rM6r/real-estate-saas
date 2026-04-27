'use client'

import { useState } from 'react'
import Image from 'next/image'

// ─── Types ──────────────────────────────────────────────────────────────────

export type Tenant = {
  id: string
  name: string
  slug: string
  primary_color: string | null
  theme?: string | null
  business_type?: string | null
}

export type Profile = {
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
    tiktok?: string
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
    announcement_color?: 'accent' | 'yellow' | 'green' | 'red' | 'purple' | 'orange' | 'teal' | 'dark'
    currency?: string
    offer_label_1?: string
    offer_label_2?: string
  } | null
} | null

export type Post = {
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
  offer_type?: string | null
  property_type?: string | null
  card_style?: string | null
  published: boolean
  created_at: string
}

export type Media = {
  id: string
  url: string
  label: string | null
  sort_order: number
}

export type TeamMember = {
  id: string
  email: string
  role: 'agent' | 'admin'
  display_name?: string | null
  photo_url?: string | null
  phone?: string | null
}

export interface ThemePageProps {
  tenant: Tenant
  profile: Profile
  listings: Post[]
  news: Post[]
  gallery: Media[]
  team: TeamMember[]
}

// ─── Constants ──────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  available: 'متاح',
  sold: 'مباع',
  rented: 'مؤجر',
}

export const STATUS_COLORS: Record<string, string> = {
  available: '#22c55e',
  sold: '#ef4444',
  rented: '#f59e0b',
}

export const DAY_LABELS_AR: Record<string, string> = {
  mon: 'الإثنين', tue: 'الثلاثاء', wed: 'الأربعاء',
  thu: 'الخميس', fri: 'الجمعة', sat: 'السبت', sun: 'الأحد',
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  SAR: 'ر.س', AED: 'د.إ', KWD: 'د.ك', QAR: 'ر.ق',
  BHD: 'د.ب', OMR: 'ر.ع', EGP: 'ج.م',
  USD: '$', EUR: '€', GBP: '£',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getPageConfig(profile: Profile) {
  return {
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
    announcement_color: 'accent' as 'accent' | 'yellow' | 'green' | 'red' | 'purple' | 'orange' | 'teal' | 'dark',
    currency: 'SAR',
    offer_label_1: 'للبيع',
    offer_label_2: 'للإيجار',
    ...(profile?.page_config ?? {}),
  }
}

export function getPageSections(profile: Profile) {
  return {
    hero: true,
    listings: true,
    about: true,
    news: true,
    footer: true,
    ...(profile?.page_sections ?? {}),
  }
}

export function buildWaLink(tenant: Tenant, profile: Profile) {
  const wa = profile?.social_links?.whatsapp
  if (!wa) return '#'
  return `https://wa.me/${wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً، وجدتك عبر موقعك ${tenant.name}`)}`
}

export function getBtnRadius(buttonShape: string, themeRadius: string) {
  if (buttonShape === 'pill') return '9999px'
  if (buttonShape === 'sharp') return '0px'
  return themeRadius
}

// ─── Icons ──────────────────────────────────────────────────────────────────

export function WaIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.529 5.856L0 24l6.302-1.508A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.021-1.378l-.36-.213-3.741.895.929-3.631-.234-.375A9.788 9.788 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z" />
    </svg>
  )
}

// ─── ContactForm ─────────────────────────────────────────────────────────────

export function ContactForm({
  tenantId,
  accentColor,
  cardBg,
  cardBorder,
  radius = '12px',
  darkText = false,
}: {
  tenantId: string
  accentColor: string
  cardBg: string
  cardBorder: string
  radius?: string
  darkText?: boolean
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'الاسم مطلوب'
    if (!phone.trim()) e.phone = 'رقم الهاتف مطلوب'
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'البريد الإلكتروني غير صحيح'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, message: message.trim() || undefined }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setErrors({ form: 'حدث خطأ. الرجاء المحاولة مرة أخرى.' })
    } finally {
      setSubmitting(false)
    }
  }

  const textColor = darkText ? '#111827' : '#f8fafc'
  const mutedColor = darkText ? '#6b7280' : '#94a3b8'
  const inputBg = darkText ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)'
  const inputBorderColor = darkText ? `${cardBorder}` : 'rgba(255,255,255,0.12)'
  const inputFocusShadow = `0 0 0 3px ${accentColor}33`

  if (submitted) {
    return (
      <div
        className="border p-10 text-center space-y-4 flex flex-col items-center"
        style={{ background: cardBg, borderColor: cardBorder, borderRadius: radius }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}22`, border: `2px solid ${accentColor}44` }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="font-bold text-xl" style={{ color: textColor }}>تم الإرسال!</p>
        <p className="text-sm" style={{ color: mutedColor }}>سنتواصل معك في أقرب وقت ممكن.</p>
      </div>
    )
  }

  const fieldWrap = 'group relative'
  const fieldInput = `w-full border px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-gray-400`

  const inputRadius = Math.min(parseInt(radius) || 12, 12) + 'px'
  const inputStyleBase = {
    background: inputBg,
    borderColor: inputBorderColor,
    borderRadius: inputRadius,
    color: textColor,
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = accentColor
    e.currentTarget.style.boxShadow = inputFocusShadow
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = inputBorderColor
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-6 sm:p-8 space-y-5"
      style={{ background: cardBg, borderColor: cardBorder, borderRadius: radius }}
      dir="rtl"
      noValidate
    >
      {errors.form && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
          </svg>
          {errors.form}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"/></svg>
            الاسم <span style={{ color: accentColor }}>*</span>
          </label>
          <input
            className={fieldInput}
            style={inputStyleBase}
            value={name}
            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
            onFocus={onFocus} onBlur={onBlur}
            placeholder="محمد أحمد"
          />
          {errors.name && <p className="text-red-400 text-xs flex items-center gap-1"><span>⚠</span>{errors.name}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg>
            رقم الهاتف <span style={{ color: accentColor }}>*</span>
          </label>
          <input
            className={fieldInput}
            style={inputStyleBase}
            value={phone}
            onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: '' })) }}
            onFocus={onFocus} onBlur={onBlur}
            placeholder="+966 5x xxx xxxx"
            dir="ltr"
          />
          {errors.phone && <p className="text-red-400 text-xs flex items-center gap-1"><span>⚠</span>{errors.phone}</p>}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/></svg>
          البريد الإلكتروني
        </label>
        <input
          type="email"
          className={fieldInput}
          style={inputStyleBase}
          value={email}
          onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
          onFocus={onFocus} onBlur={onBlur}
          placeholder="example@email.com"
          dir="ltr"
        />
        {errors.email && <p className="text-red-400 text-xs flex items-center gap-1"><span>⚠</span>{errors.email}</p>}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2z" clipRule="evenodd"/></svg>
          الرسالة
        </label>
        <textarea
          className={`${fieldInput} resize-none`}
          style={inputStyleBase}
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          placeholder="كيف يمكننا مساعدتك؟"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: accentColor, borderRadius: radius, boxShadow: `0 4px 20px ${accentColor}44` }}
      >
        {submitting ? (
          <>
            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            جاري الإرسال...
          </>
        ) : (
          <>
            إرسال الرسالة
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 rotate-180">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z"/>
            </svg>
          </>
        )}
      </button>
    </form>
  )
}

// ─── SocialLinks ─────────────────────────────────────────────────────────────

export function SocialLinks({ profile, waLink, bgClass = 'bg-gray-800' }: { profile: Profile; waLink: string; bgClass?: string }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {profile?.social_links?.instagram && (
        <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer"
          className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h-.165zm3.77 4.53a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" clipRule="evenodd" />
          </svg>
        </a>
      )}
      {profile?.social_links?.x && (
        <a href={profile.social_links.x} target="_blank" rel="noopener noreferrer"
          className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      )}
      {profile?.social_links?.linkedin && (
        <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer"
          className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      )}
      {profile?.social_links?.snapchat && (
        <a href={`https://snapchat.com/add/${profile.social_links.snapchat.replace(/^https?:\/\/snapchat\.com\/add\//, '')}`} target="_blank" rel="noopener noreferrer"
          className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-black transition-all`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12.166 2C9.033 2 6.6 3.64 5.567 6.227c-.28.706-.236 1.883-.198 2.81l.006.163c-.18.093-.407.134-.65.134-.34 0-.694-.096-.988-.27a.484.484 0 0 0-.252-.069c-.133 0-.264.04-.368.122-.155.12-.228.306-.197.497.064.39.508.683 1.11.875.05.015.1.03.147.047-.07.17-.127.35-.127.546 0 .148.032.287.086.415-.6.4-1.363.784-2.19.963a.507.507 0 0 0-.393.49c0 .273.199.501.47.537.94.124 1.59.59 2.073 1.066.41.404.587.8.526 1.214-.057.39-.38.696-.757.93a2.65 2.65 0 0 1-.355.187c-.272.115-.406.276-.406.495 0 .303.248.497.678.556.6.083 1.115.373 1.576.888.387.433.673 1.001.847 1.693.068.27.262.422.52.422.133 0 .272-.037.39-.104.43-.246.889-.371 1.364-.371.21 0 .424.026.637.077.522.127 1.025.403 1.542.693.747.42 1.52.855 2.486.855.964 0 1.742-.436 2.49-.856.516-.29 1.02-.566 1.54-.693.213-.05.427-.077.638-.077.475 0 .934.125 1.363.37.118.068.258.105.391.105.258 0 .452-.152.52-.422.174-.692.46-1.26.847-1.693.46-.515.977-.805 1.576-.888.43-.059.678-.253.678-.556 0-.219-.134-.38-.406-.495a2.65 2.65 0 0 1-.355-.187c-.377-.234-.7-.54-.757-.93-.061-.414.116-.81.526-1.214.483-.476 1.134-.942 2.073-1.066a.538.538 0 0 0 .47-.537.507.507 0 0 0-.394-.49c-.826-.179-1.589-.563-2.19-.963.054-.128.086-.267.086-.415 0-.197-.057-.376-.127-.546.048-.017.097-.032.147-.047.602-.192 1.046-.485 1.11-.875a.507.507 0 0 0-.197-.497.506.506 0 0 0-.368-.122.484.484 0 0 0-.252.069c-.294.174-.648.27-.988.27-.243 0-.47-.041-.65-.134l.006-.163c.038-.927.082-2.104-.198-2.81C17.4 3.64 14.966 2 11.834 2h.332z" />
          </svg>
        </a>
      )}
      {profile?.social_links?.tiktok && (
        <a href={profile.social_links.tiktok.startsWith('http') ? profile.social_links.tiktok : `https://tiktok.com/@${profile.social_links.tiktok.replace(/^@/, '')}`}
          target="_blank" rel="noopener noreferrer"
          className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
          </svg>
        </a>
      )}
      {profile?.social_links?.whatsapp && (
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-white transition-all`}>
          <WaIcon />
        </a>
      )}
    </div>
  )
}

// ─── WorkingHours ────────────────────────────────────────────────────────────

export function WorkingHours({ hours, textClass = 'text-gray-400' }: { hours?: Record<string, { enabled: boolean; open: string; close: string }> | null; textClass?: string }) {
  if (!hours) return null
  return (
    <div className="space-y-1">
      {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map((day) => {
        const h = hours[day]
        if (!h) return null
        return (
          <div key={day} className={`flex justify-between text-xs ${textClass}`}>
            <span>{DAY_LABELS_AR[day] ?? day}</span>
            <span>{h.enabled ? `${h.open} – ${h.close}` : 'مغلق'}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── ListingBadges ────────────────────────────────────────────────────────────

export function ListingBadges({
  listing,
  primary,
  offerLabel1 = 'للبيع',
  offerLabel2 = 'للإيجار',
}: {
  listing: Post
  primary: string
  offerLabel1?: string
  offerLabel2?: string
}) {
  return (
    <>
      {listing.listing_status && (
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: STATUS_COLORS[listing.listing_status] ?? primary }}>
          {STATUS_LABELS[listing.listing_status] ?? listing.listing_status}
        </span>
      )}
      {listing.offer_type && (
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: listing.offer_type === 'sale' ? '#2563eb' : '#7c3aed' }}>
          {listing.offer_type === 'sale' ? offerLabel1 : offerLabel2}
        </span>
      )}
      {listing.images.length > 1 && (
        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
          📷 {listing.images.length}
        </span>
      )}
    </>
  )
}

// ─── PropertyCard ────────────────────────────────────────────────────────────

export function PropertyCard({
  listing,
  onClick,
  cardStyle,
  surfaceClass,
  mutedClass,
  primary,
  sectionAlt,
  currency = 'SAR',
  showRealEstateFields = true,
  offerLabel1 = 'للبيع',
  offerLabel2 = 'للإيجار',
  imageHeight = 'h-52',
}: {
  listing: Post
  onClick: () => void
  cardStyle: React.CSSProperties
  surfaceClass: string
  mutedClass: string
  primary: string
  sectionAlt: string
  currency?: string
  showRealEstateFields?: boolean
  offerLabel1?: string
  offerLabel2?: string
  imageHeight?: string
}) {
  const offerColor = listing.offer_type === 'rent' ? 'rgba(5,150,105,0.88)' : 'rgba(37,99,235,0.88)'

  return (
    <button
      onClick={onClick}
      className={`text-right group border overflow-hidden transition-all duration-300 w-full active:scale-[0.97] hover:-translate-y-1.5 hover:shadow-2xl ${surfaceClass}`}
      style={cardStyle}
      aria-label={`عرض تفاصيل العقار: ${listing.title}`}
    >
      {/* Image area */}
      <div className="relative overflow-hidden">
        {listing.images[0] ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            width={400}
            height={256}
            className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${imageHeight}`}
          />
        ) : (
          <div className={`w-full flex flex-col items-center justify-center gap-2 ${imageHeight}`} style={{ background: sectionAlt }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
            </svg>
            <span className="text-xs opacity-40">لا توجد صورة</span>
          </div>
        )}

        {/* Bottom gradient for price overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Offer type badge — top right */}
        {listing.offer_type && (
          <span
            className="absolute top-3 right-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: offerColor }}
          >
            {listing.offer_type === 'sale' ? offerLabel1 : offerLabel2}
          </span>
        )}

        {/* Status badge — top left (if not available) */}
        {listing.listing_status && listing.listing_status !== 'available' && (
          <span
            className="absolute top-3 left-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[listing.listing_status] ?? '#6b7280' }}
          >
            {STATUS_LABELS[listing.listing_status] ?? listing.listing_status}
          </span>
        )}

        {/* Price overlay — bottom of image */}
        {listing.price != null && (
          <div className="absolute bottom-0 inset-x-0 px-3 pb-3 flex items-end justify-between">
            <p className="text-white font-bold text-base sm:text-lg leading-none drop-shadow-sm">
              {listing.price.toLocaleString('ar-SA')}
              <span className="text-xs font-medium opacity-80 mr-1">{CURRENCY_SYMBOLS[currency] ?? currency}</span>
            </p>
            {listing.property_type && (
              <span className="text-white/80 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                {listing.property_type}
              </span>
            )}
          </div>
        )}

        {/* Tap hint overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Card body */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base line-clamp-1 mb-1">{listing.title}</h3>
        {listing.location && (
          <div className={`flex items-center gap-1 text-xs mb-2 ${mutedClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{listing.location}</span>
          </div>
        )}
        {showRealEstateFields && (listing.bedrooms != null || listing.bathrooms != null || listing.area_sqm != null) && (
          <div className="flex items-center gap-3 text-xs" style={{ color: primary }}>
            {listing.bedrooms != null && (
              <span className="flex items-center gap-1 opacity-80">
                <span>🛏</span> {listing.bedrooms}
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-1 opacity-80">
                <span>🚿</span> {listing.bathrooms}
              </span>
            )}
            {listing.area_sqm != null && (
              <span className="flex items-center gap-1 opacity-80">
                <span>📐</span> {listing.area_sqm} م²
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
