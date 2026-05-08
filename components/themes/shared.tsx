'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BedDouble, Bath, Ruler, CalendarDays, Gauge, Tag } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/whatsapp'

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
  licence_numbers?: { label: string; number: string }[] | null
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
    telegram?: string
    discord?: string
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
    contact?: boolean
    footer?: boolean
    working_hours?: boolean
    order?: Array<'hero' | 'listings' | 'about' | 'news' | 'contact' | 'working_hours' | 'footer'>
  } | null
  page_config?: {
    hero_headline?: string
    featured_count?: number
    listings_columns?: 2 | 3 | 4
    show_listing_filters?: boolean
    show_listing_search?: boolean
    show_listing_sort?: boolean
    filter_label_all?: string
    filter_label_all_types?: string
    filter_label_all_status?: string
    hero_style?: 'centered' | 'split' | 'minimal'
    hero_cta_text?: string
    button_shape?: 'pill' | 'soft' | 'sharp'
    headingFont?: string
    seo_title?: string
    seo_description?: string
    announcement_text?: string
    announcement_color?: 'accent' | 'yellow' | 'green' | 'red' | 'purple' | 'orange' | 'teal' | 'dark'
    currency?: string
    offer_label_1?: string
    offer_label_2?: string
    page_lang?: 'ar' | 'en'
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
  isPreview?: boolean
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

export const DAY_LABELS_EN: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

export const THEME_LABELS = {
  ar: {
    about: 'نبذة',
    contactHeading: 'التواصل',
    contactSubtitle: 'نسعد بخدمتك — عبر:',
    listingsHeading: 'قائمة العروض',
    listingsHeadingAlt: 'العروض المتاحة',
    newsHeading: 'آخر الأخبار',
    workingHoursHeading: 'أوقات العمل',
    licencePrefix: 'رقم الترخيص:',
    footerCopyright: 'جميع الحقوق محفوظة',
    footerContact: 'التواصل',
    closed: 'مغلق',
    formName: 'الاسم',
    formNameRequired: 'الاسم مطلوب',
    formNamePlaceholder: 'محمد أحمد',
    formPhone: 'رقم الهاتف',
    formPhoneRequired: 'رقم الهاتف مطلوب',
    formEmail: 'البريد الإلكتروني',
    formEmailInvalid: 'البريد الإلكتروني غير صحيح',
    formMessage: 'الرسالة',
    formMessagePlaceholder: 'كيف يمكننا مساعدتك؟',
    formSubmit: 'إرسال الرسالة',
    formSubmitting: 'جاري الإرسال...',
    formSuccessTitle: 'تم الإرسال!',
    formSuccessMsg: 'سنتواصل معك في أقرب وقت ممكن.',
    formError: 'حدث خطأ. الرجاء المحاولة مرة أخرى.',
    waMessage: (name: string) => `مرحباً، وجدتك عبر موقعك ${name}`,
    days: DAY_LABELS_AR,
    statusLabels: { available: 'متاح', sold: 'مباع', rented: 'مؤجر' },
  },
  en: {
    about: 'About Us',
    contactHeading: 'Contact Us',
    contactSubtitle: "We're happy to help — reach us via:",
    listingsHeading: 'Our Listings',
    listingsHeadingAlt: 'Available Listings',
    newsHeading: 'Latest News',
    workingHoursHeading: 'Working Hours',
    licencePrefix: 'License #:',
    footerCopyright: 'All rights reserved',
    footerContact: 'Contact',
    closed: 'Closed',
    formName: 'Name',
    formNameRequired: 'Name is required',
    formNamePlaceholder: 'John Smith',
    formPhone: 'Phone',
    formPhoneRequired: 'Phone number is required',
    formEmail: 'Email',
    formEmailInvalid: 'Invalid email address',
    formMessage: 'Message',
    formMessagePlaceholder: 'How can we help you?',
    formSubmit: 'Send Message',
    formSubmitting: 'Sending...',
    formSuccessTitle: 'Sent!',
    formSuccessMsg: "We'll get back to you soon.",
    formError: 'An error occurred. Please try again.',
    waMessage: (name: string) => `Hi, I found you via your website: ${name}`,
    days: DAY_LABELS_EN,
    statusLabels: { available: 'Available', sold: 'Sold', rented: 'Rented' },
  },
} as const

export const CURRENCY_SYMBOLS: Record<string, string> = {
  SAR: '⃁', AED: 'د.إ', KWD: 'د.ك', QAR: 'ر.ق',
  BHD: 'د.ب', OMR: 'ر.ع', EGP: 'ج.م',
  USD: '$', EUR: '€', GBP: '£',
  'ر.س': '⃁',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getPageConfig(profile: Profile) {
  return {
    hero_headline: 'اكتشف أفضل العروض لديك',
    featured_count: 6,
    listings_columns: 3 as 2 | 3 | 4,
    show_listing_filters: true,
    show_listing_search: true,
    filter_label_all: 'الكل',
    filter_label_all_types: 'كل الأنواع',
    filter_label_all_status: 'كل الحالات',
    hero_style: 'centered' as 'centered' | 'split' | 'minimal',
    hero_cta_text: 'تواصل عبر واتساب',
    button_shape: 'soft' as 'pill' | 'soft' | 'sharp',
    headingFont: 'inherit',
    seo_title: '',
    seo_description: '',
    announcement_text: '',
    announcement_color: 'accent' as 'accent' | 'yellow' | 'green' | 'red' | 'purple' | 'orange' | 'teal' | 'dark',
    currency: 'SAR',
    offer_label_1: 'للبيع',
    offer_label_2: 'للإيجار',
    page_lang: 'ar' as 'ar' | 'en',
    ...(profile?.page_config ?? {}),
    // Global UI decision: keep hero centered (no split header layout)
    hero_style: 'centered' as 'centered' | 'split' | 'minimal',
    // Global UI decision: hide search + price sort chips on public themes
    show_listing_search: false,
    show_listing_sort: false,
  }
}

export function getPageSections(profile: Profile) {
  return {
    hero: true,
    listings: true,
    about: true,
    news: true,
    footer: true,
    contact: true,
    working_hours: true,
    order: ['hero', 'listings', 'about', 'news', 'contact', 'working_hours', 'footer'] as const,
    ...(profile?.page_sections ?? {}),
  }
}

export function getSectionOrderMap(profile: Profile) {
  const sections = getPageSections(profile)
  const defaultOrder: Array<'hero' | 'listings' | 'about' | 'news' | 'contact' | 'working_hours' | 'footer'> = [
    'hero',
    'listings',
    'about',
    'news',
    'contact',
    'working_hours',
    'footer',
  ]

  const rawOrder = sections.order ?? defaultOrder
  const normalized = Array.from(new Set([...rawOrder, ...defaultOrder]))

  return normalized.reduce<Record<string, number>>((acc, key, index) => {
    acc[key] = index + 1
    return acc
  }, {})
}

export function buildWaLink(tenant: Tenant, profile: Profile, lang: 'ar' | 'en' = 'ar') {
  const wa = profile?.social_links?.whatsapp
  if (!wa) return '#'
  const msg = THEME_LABELS[lang].waMessage(tenant.name)
  return buildWhatsAppLink(wa, msg)
}

export function getBtnRadius(buttonShape: string, themeRadius: string) {
  if (buttonShape === 'pill') return '9999px'
  if (buttonShape === 'sharp') return '0px'
  return themeRadius
}

export function getHeadingFont(selectedFont?: string, fallbackFont?: string) {
  if (selectedFont && selectedFont !== 'inherit') return selectedFont
  if (fallbackFont) return fallbackFont
  return 'inherit'
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
  lang = 'ar',
}: {
  tenantId: string
  accentColor: string
  cardBg: string
  cardBorder: string
  radius?: string
  darkText?: boolean
  lang?: 'ar' | 'en'
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
    const L = THEME_LABELS[lang]
    if (!name.trim()) e.name = L.formNameRequired
    if (!phone.trim()) e.phone = L.formPhoneRequired
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = L.formEmailInvalid
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
      setErrors({ form: THEME_LABELS[lang].formError })
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
        <p className="font-bold text-xl" style={{ color: textColor }}>{THEME_LABELS[lang].formSuccessTitle}</p>
        <p className="text-sm" style={{ color: mutedColor }}>{THEME_LABELS[lang].formSuccessMsg}</p>
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

  const L = THEME_LABELS[lang]

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-6 sm:p-8 space-y-5"
      style={{ background: cardBg, borderColor: cardBorder, borderRadius: radius }}
      dir={lang === 'en' ? 'ltr' : 'rtl'}
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
            {L.formName} <span style={{ color: accentColor }}>*</span>
          </label>
          <input
            className={fieldWrap + ' ' + fieldInput}
            style={inputStyleBase}
            value={name}
            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
            onFocus={onFocus} onBlur={onBlur}
            placeholder={L.formNamePlaceholder}
          />
          {errors.name && <p className="text-red-400 text-xs flex items-center gap-1"><span>⚠</span>{errors.name}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15 15 0 012 3.5z" clipRule="evenodd"/></svg>
            {L.formPhone} <span style={{ color: accentColor }}>*</span>
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
          {L.formEmail}
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
          {L.formMessage}
        </label>
        <textarea
          className={`${fieldInput} resize-none`}
          style={inputStyleBase}
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          placeholder={L.formMessagePlaceholder}
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
            {L.formSubmitting}
          </>
        ) : (
          <>
            {L.formSubmit}
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

export function SocialLinks({ profile, waLink }: { profile: Profile; waLink: string; bgClass?: string }) {
  const cleanHandle = (value?: string | null) => {
    const v = (value || '').trim()
    if (!v) return ''
    return v
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/^@/, '')
      .replace(/[?#].*$/, '')
      .replace(/^\/+|\/+$/g, '')
  }

  const toSocialHref = (
    network: 'instagram' | 'x' | 'linkedin' | 'snapchat' | 'tiktok' | 'telegram' | 'discord',
    raw?: string | null,
  ) => {
    const v = (raw || '').trim()
    if (!v) return ''
    if (/^https?:\/\//i.test(v)) return v

    const h = cleanHandle(v)
    if (!h) return ''

    if (network === 'instagram') return `https://instagram.com/${h.replace(/^instagram\.com\//i, '')}`
    if (network === 'x') return `https://x.com/${h.replace(/^(x\.com|twitter\.com)\//i, '')}`
    if (network === 'linkedin') {
      const l = h.replace(/^linkedin\.com\//i, '')
      if (/^(in|company|school|showcase)\//i.test(l)) return `https://linkedin.com/${l}`
      return `https://linkedin.com/in/${l}`
    }
    if (network === 'snapchat') return `https://snapchat.com/add/${h.replace(/^snapchat\.com\/add\//i, '')}`
    if (network === 'telegram') return `https://t.me/${h.replace(/^t\.me\//i, '').replace(/^@/, '')}`
    if (network === 'discord') return h
    return `https://tiktok.com/@${h.replace(/^tiktok\.com\//i, '').replace(/^@/, '')}`
  }

  const instagramHref = toSocialHref('instagram', profile?.social_links?.instagram)
  const xHref = toSocialHref('x', profile?.social_links?.x)
  const linkedinHref = toSocialHref('linkedin', profile?.social_links?.linkedin)
  const snapchatHref = toSocialHref('snapchat', profile?.social_links?.snapchat)
  const tiktokHref = toSocialHref('tiktok', profile?.social_links?.tiktok)
  const telegramHref = toSocialHref('telegram', profile?.social_links?.telegram)
  const discordHref = toSocialHref('discord', profile?.social_links?.discord)

  const iconBase = 'w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-105'
  return (
    <div className="flex gap-2 flex-wrap">
      {instagramHref && (
        <a href={instagramHref} target="_blank" rel="noopener noreferrer"
          className={`${iconBase} shadow-[0_4px_14px_rgba(225,48,108,0.35)]`}
          style={{ background: 'linear-gradient(135deg,#feda75 0%,#fa7e1e 22%,#d62976 55%,#962fbf 78%,#4f5bd5 100%)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h-.165zm3.77 4.53a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" clipRule="evenodd" />
          </svg>
        </a>
      )}
      {xHref && (
        <a href={xHref} target="_blank" rel="noopener noreferrer"
          className={`${iconBase} shadow-[0_4px_14px_rgba(0,0,0,0.35)]`}
          style={{ backgroundColor: '#000000' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      )}
      {linkedinHref && (
        <a href={linkedinHref} target="_blank" rel="noopener noreferrer"
          className={`${iconBase} shadow-[0_4px_14px_rgba(10,102,194,0.35)]`}
          style={{ backgroundColor: '#0A66C2' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      )}
      {snapchatHref && (
        <a href={snapchatHref} target="_blank" rel="noopener noreferrer"
          className={`${iconBase} shadow-[0_4px_14px_rgba(255,252,0,0.35)]`}
          style={{ backgroundColor: '#FFFC00', color: '#111827' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12.166 2C9.033 2 6.6 3.64 5.567 6.227c-.28.706-.236 1.883-.198 2.81l.006.163c-.18.093-.407.134-.65.134-.34 0-.694-.096-.988-.27a.484.484 0 0 0-.252-.069c-.133 0-.264.04-.368.122-.155.12-.228.306-.197.497.064.39.508.683 1.11.875.05.015.1.03.147.047-.07.17-.127.35-.127.546 0 .148.032.287.086.415-.6.4-1.363.784-2.19.963a.507.507 0 0 0-.393.49c0 .273.199.501.47.537.94.124 1.59.59 2.073 1.066.41.404.587.8.526 1.214-.057.39-.38.696-.757.93a2.65 2.65 0 0 1-.355.187c-.272.115-.406.276-.406.495 0 .303.248.497.678.556.6.083 1.115.373 1.576.888.387.433.673 1.001.847 1.693.068.27.262.422.52.422.133 0 .272-.037.39-.104.43-.246.889-.371 1.364-.371.21 0 .424.026.637.077.522.127 1.025.403 1.542.693.747.42 1.52.855 2.486.855.964 0 1.742-.436 2.49-.856.516-.29 1.02-.566 1.54-.693.213-.05.427-.077.638-.077.475 0 .934.125 1.363.37.118.068.258.105.391.105.258 0 .452-.152.52-.422.174-.692.46-1.26.847-1.693.46-.515.977-.805 1.576-.888.43-.059.678-.253.678-.556 0-.219-.134-.38-.406-.495a2.65 2.65 0 0 1-.355-.187c-.377-.234-.7-.54-.757-.93-.061-.414.116-.81.526-1.214.483-.476 1.134-.942 2.073-1.066a.538.538 0 0 0 .47-.537.507.507 0 0 0-.394-.49c-.826-.179-1.589-.563-2.19-.963.054-.128.086-.267.086-.415 0-.197-.057-.376-.127-.546.048-.017.097-.032.147-.047.602-.192 1.046-.485 1.11-.875a.507.507 0 0 0-.197-.497.506.506 0 0 0-.368-.122.484.484 0 0 0-.252.069c-.294.174-.648.27-.988.27-.243 0-.47-.041-.65-.134l.006-.163c.038-.927.082-2.104-.198-2.81C17.4 3.64 14.966 2 11.834 2h.332z" />
          </svg>
        </a>
      )}
      {tiktokHref && (
        <a href={tiktokHref}
          target="_blank" rel="noopener noreferrer"
          className={`${iconBase} shadow-[0_4px_14px_rgba(0,0,0,0.35)]`}
          style={{ backgroundColor: '#000000' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
          </svg>
        </a>
      )}
      {telegramHref && (
        <a href={telegramHref} target="_blank" rel="noopener noreferrer"
          className={`${iconBase} shadow-[0_4px_14px_rgba(0,136,204,0.35)]`}
          style={{ backgroundColor: '#0088cc' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </a>
      )}
      {discordHref && (
        <a href={discordHref} target="_blank" rel="noopener noreferrer"
          className={`${iconBase} shadow-[0_4px_14px_rgba(88,101,242,0.35)]`}
          style={{ backgroundColor: '#5865F2' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </a>
      )}
      {profile?.social_links?.whatsapp && (
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          className={`${iconBase} shadow-[0_4px_14px_rgba(37,211,102,0.35)]`}
          style={{ backgroundColor: '#25D366' }}>
          <WaIcon />
        </a>
      )}
    </div>
  )
}

// ─── WorkingHours ────────────────────────────────────────────────────────────

export function WorkingHours({ hours, textClass = 'text-gray-400', lang = 'ar' }: { hours?: Record<string, { enabled: boolean; open: string; close: string }> | null; textClass?: string; lang?: 'ar' | 'en' }) {
  if (!hours) return null
  const dayLabels = THEME_LABELS[lang].days
  const closedLabel = THEME_LABELS[lang].closed
  return (
    <div className="space-y-1">
      {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map((day) => {
        const h = hours[day]
        if (!h) return null
        return (
          <div key={day} className={`flex justify-between text-xs ${textClass}`} style={h.enabled ? undefined : { opacity: 0.4 }}>
            <span style={h.enabled ? undefined : { textDecoration: 'line-through' }}>{dayLabels[day] ?? day}</span>
            <span>{h.enabled ? `${h.open} – ${h.close}` : closedLabel}</span>
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
  statusLabels,
  lang = 'ar',
}: {
  listing: Post
  primary: string
  statusLabels?: Record<string, string>
  lang?: 'ar' | 'en'
}) {
  const sLabels = statusLabels ?? STATUS_LABELS
  return (
    <>

      {listing.images.length > 1 && (
        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM10 14a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          {listing.images.length}
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
  businessType,
  imageHeight = 'h-52',
  statusLabels,
  lang = 'ar',
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
  businessType?: string | null
  imageHeight?: string
  statusLabels?: Record<string, string>
  lang?: 'ar' | 'en'
}) {
  const sLabels2 = statusLabels ?? STATUS_LABELS
  const isCarDealer = businessType === 'car_dealer'
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)

  const hasSpecs = isCarDealer
    ? (listing.bedrooms != null || listing.bathrooms != null || listing.property_type)
    : (showRealEstateFields && !isCarDealer && (listing.bedrooms != null || listing.bathrooms != null || listing.area_sqm != null))

  const realEstateSpecs = !isCarDealer && showRealEstateFields ? [
    listing.bedrooms != null ? { icon: <BedDouble className="w-3.5 h-3.5" />, value: listing.bedrooms, label: lang === 'en' ? 'Beds' : 'غرف' } : null,
    listing.bathrooms != null ? { icon: <Bath className="w-3.5 h-3.5" />, value: listing.bathrooms, label: lang === 'en' ? 'Baths' : 'حمامات' } : null,
    listing.area_sqm != null ? { icon: <Ruler className="w-3.5 h-3.5" />, value: `${listing.area_sqm}`, label: lang === 'en' ? 'sqm' : 'م²' } : null,
  ].filter(Boolean) as { icon: React.ReactNode; value: string | number; label: string }[] : []

  const carSpecs = isCarDealer ? [
    listing.bedrooms != null ? { icon: <CalendarDays className="w-3.5 h-3.5" />, value: listing.bedrooms, label: lang === 'en' ? 'Year' : 'سنة' } : null,
    listing.bathrooms != null ? { icon: <Gauge className="w-3.5 h-3.5" />, value: listing.bathrooms, label: lang === 'en' ? 'km' : 'كم' } : null,
    listing.property_type ? { icon: <Tag className="w-3.5 h-3.5" />, value: listing.property_type, label: lang === 'en' ? 'Type' : 'نوع' } : null,
  ].filter(Boolean) as { icon: React.ReactNode; value: string | number; label: string }[] : []

  const specs = isCarDealer ? carSpecs : realEstateSpecs

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`text-right group border overflow-hidden transition-all duration-300 w-full active:scale-[0.97] hover:-translate-y-2 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 ${surfaceClass}`}
      style={{
        ...cardStyle,
        borderColor: hovered ? `${primary}55` : cardStyle.borderColor,
        boxShadow: hovered
          ? `${cardStyle.boxShadow ?? ''}, 0 0 0 1px ${primary}28`
          : `${cardStyle.boxShadow ?? '0 1px 4px rgba(0,0,0,.35)'}, inset 0 1px 0 rgba(255,255,255,.06)`,
      }}
      aria-label={lang === 'en' ? `View details: ${listing.title}` : `عرض التفاصيل: ${listing.title}`}
    >
      {/* Image area */}
      <div className="relative overflow-hidden">
        {listing.images[0] && !imgError ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            width={400}
            height={256}
            className={`w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${imageHeight}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`w-full flex flex-col items-center justify-center gap-2 ${imageHeight}`}
            style={{ background: `linear-gradient(135deg, ${sectionAlt} 0%, rgba(0,0,0,0.3) 100%)` }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
            </svg>
          </div>
        )}

        {/* Bottom gradient for price overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

        {/* Top badges row — status only */}
        <div className="absolute top-3 inset-x-3 flex items-start justify-end pointer-events-none">
          <span />
          {listing.listing_status && listing.listing_status !== 'available' && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm leading-5"
              style={{
                backgroundColor: listing.listing_status === 'sold' ? 'rgba(239,68,68,0.85)' : 'rgba(245,158,11,0.85)',
                color: '#fff',
              }}
            >
              {(statusLabels ?? STATUS_LABELS)[listing.listing_status] ?? listing.listing_status}
            </span>
          )}
        </div>

        {/* Image count badge */}
        {listing.images.length > 1 && (
          <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-black/55 backdrop-blur-sm text-white/80 px-2 py-0.5 rounded-full leading-5 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM10 14a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            {listing.images.length}
          </span>
        )}

        {/* Price overlay — bottom of image */}
        {listing.price != null && (
          <div className="absolute bottom-0 inset-x-0 px-3 pb-3 flex items-end justify-between">
            <p className="text-white font-bold text-base sm:text-lg leading-none drop-shadow-sm flex items-baseline gap-1">
              <span className="text-xs font-medium opacity-70">{CURRENCY_SYMBOLS[currency] ?? currency}</span>
              {listing.price.toLocaleString('en-US')}
            </p>
            {listing.property_type && !listing.offer_type && (
              <span className="text-white/80 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                {listing.property_type}
              </span>
            )}
          </div>
        )}

        {/* Hover shimmer */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Card body */}
      <div className="p-4 sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-bold text-base sm:text-[17px] line-clamp-2 leading-snug">{listing.title}</h3>
          <span
            className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100"
            style={{ backgroundColor: `${primary}22`, color: primary }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.69L10.22 7.03a.75.75 0 111.06-1.06l3.5 3.5a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 11-1.06-1.06l2.22-2.22H5.75A.75.75 0 015 10z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        {listing.location && (
          <div className={`flex items-center gap-1 text-xs mb-2.5 ${mutedClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{listing.location}</span>
          </div>
        )}

        {/* Specs mini-grid */}
        {specs.length > 0 && (
          <div
            className="grid mt-2 pt-2.5"
            style={{
              gridTemplateColumns: `repeat(${specs.length}, 1fr)`,
              borderTop: `1px solid ${primary}18`,
              direction: 'ltr',
            }}
          >
            {specs.map((spec, i) => (
              <div key={i} className={`flex flex-col items-center gap-0.5 py-1 px-1 text-center ${i > 0 ? 'border-l border-white/[0.06]' : ''}`}>
                <span style={{ color: primary }}>{spec.icon}</span>
                <span className="text-xs font-bold leading-none mt-0.5" style={{ color: primary }}>{spec.value}</span>
                <span className="text-[9px] leading-none mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>{spec.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

// ─── EmptyState ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  label,
  accent,
  lang = 'ar',
}: {
  icon: 'listings' | 'news' | 'gallery'
  label?: string
  accent?: string
  lang?: 'ar' | 'en'
}) {
  const icons = {
    listings: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
    news: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z" />
        <path d="M14 2v6h6M8 13h8M8 17h4" />
      </svg>
    ),
    gallery: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  }

  const defaultLabels = lang === 'en'
    ? { listings: 'No listings available', news: 'No news yet', gallery: 'No photos yet' }
    : { listings: 'لا توجد عروض متاحة', news: 'لا توجد أخبار', gallery: 'لا توجد صور' }

  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/[0.025] py-16 text-center">
      <div
        className="rounded-3xl p-5 transition-transform duration-300 hover:scale-110"
        style={{ color: accent ?? '#94a3b8', backgroundColor: `${accent ?? '#94a3b8'}14` }}
      >
        {icons[icon]}
      </div>
      <p className="text-sm font-medium opacity-70" style={{ color: accent ?? '#94a3b8' }}>
        {label ?? defaultLabels[icon]}
      </p>
    </div>
  )
}
