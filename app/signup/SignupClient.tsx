'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Eye, EyeOff, Globe, Loader2 } from 'lucide-react'
import type { LoginBranding, LoginLang } from '@/lib/login-branding'

const translations: Record<LoginLang, {
  title: string
  businessName: string
  businessSlug: string
  email: string
  password: string
  createAccount: string
  alreadyHaveAccount: string
  signIn: string
  businessNamePlaceholder: string
  businessSlugPlaceholder: string
  emailPlaceholder: string
  passwordPlaceholder: string
  hidePassword: string
  showPassword: string
}> = {
  ar: {
    title: 'إنشاء حساب جديد',
    businessName: 'اسم النشاط',
    businessSlug: 'رابط النشاط',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    createAccount: 'إنشاء الحساب',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    signIn: 'تسجيل الدخول',
    businessNamePlaceholder: 'مثال: عقارات الخليج',
    businessSlugPlaceholder: 'مثال: gulf-realty',
    emailPlaceholder: 'you@agency.com',
    passwordPlaceholder: '٨ أحرف على الأقل',
    hidePassword: 'إخفاء كلمة المرور',
    showPassword: 'إظهار كلمة المرور',
  },
  en: {
    title: 'Create your account',
    businessName: 'Business name',
    businessSlug: 'Business URL',
    email: 'Email address',
    password: 'Password',
    createAccount: 'Create account',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign in',
    businessNamePlaceholder: 'Example: Gulf Realty',
    businessSlugPlaceholder: 'Example: gulf-realty',
    emailPlaceholder: 'you@agency.com',
    passwordPlaceholder: 'At least 8 characters',
    hidePassword: 'Hide password',
    showPassword: 'Show password',
  },
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export default function SignupClient({ branding }: { branding: LoginBranding }) {
  const router = useRouter()
  const [lang, setLangState] = useState<LoginLang>(branding.initialLang)
  const [businessName, setBusinessName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as LoginLang | null
    if (savedLang === 'ar' || savedLang === 'en') setLangState(savedLang)
  }, [])

  const setLang = (newLang: LoginLang) => {
    setLangState(newLang)
    localStorage.setItem('app_lang', newLang)
  }

  const t = translations[lang]
  const isRTL = lang === 'ar'

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(businessName))
    }
  }, [businessName, slugTouched])

  const mapError = (message: string) => {
    const m = message.toLowerCase()
    if (m.includes('email already')) return lang === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email is already in use'
    if (m.includes('url is already taken')) return lang === 'ar' ? 'رابط النشاط مستخدم بالفعل' : 'Business URL is already taken'
    if (m.includes('invalid input')) return lang === 'ar' ? 'المدخلات غير صحيحة' : 'Invalid input'
    return message
  }

  const submitDisabled = useMemo(() => {
    return (
      loading ||
      businessName.trim().length < 2 ||
      slug.trim().length < 2 ||
      !/^[a-z0-9-]+$/.test(slug) ||
      email.trim().length < 5 ||
      password.length < 8
    )
  }, [loading, businessName, slug, email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          slug,
          email,
          password,
        }),
      })

      if (!signupRes.ok) {
        const data = await signupRes.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Failed to create account')
      }

      const { auth } = await import('@/lib/firebase')
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
      const token = await cred.user.getIdToken()

      const sessionRes = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!sessionRes.ok) {
        const data = await sessionRes.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Session creation failed')
      }

      sessionStorage.removeItem('demo_auth')
      document.cookie = 'demo_session=; path=/; max-age=0; SameSite=Lax'
      router.push('/dashboard')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to create account'
      setError(mapError(message))
    } finally {
      setLoading(false)
    }
  }

  const buttonGradient = {
    background: `linear-gradient(135deg, ${branding.accentColor} 0%, #0ea5e9 100%)`,
    boxShadow: `0 14px 28px -14px ${branding.accentColor}88`,
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url('${branding.backgroundImage}')` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/45 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-[480px] space-y-4">
          <div className="flex flex-col items-center gap-1 pb-0 text-center">
            <Image
              src={branding.logoUrl}
              alt={branding.brandName}
              width={64}
              height={64}
              className="h-14 w-14 sm:h-16 sm:w-16 object-contain"
            />
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-none bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-300 bg-clip-text text-transparent tracking-tight">
              {branding.brandName}
            </h1>
          </div>

          <div className="rounded-2xl p-4 sm:p-6 space-y-4" style={{ background: 'rgba(6,6,20,0.62)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: `0 0 0 1px ${branding.accentColor}22` }}>
            <h2 className="text-lg font-bold text-white text-center">{t.title}</h2>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="signup-name" className="text-white/90 text-sm block">{t.businessName}</Label>
                <Input
                  id="signup-name"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-11 text-sm bg-slate-900/70 border-slate-600/60 text-slate-100 placeholder:text-slate-500"
                  placeholder={t.businessNamePlaceholder}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-slug" className="text-white/90 text-sm block">{t.businessSlug}</Label>
                <Input
                  id="signup-slug"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setSlug(slugify(e.target.value))
                  }}
                  dir="ltr"
                  className="h-11 text-sm bg-slate-900/70 border-slate-600/60 text-slate-100 placeholder:text-slate-500"
                  placeholder={t.businessSlugPlaceholder}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-white/90 text-sm block">{t.email}</Label>
                <Input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  autoComplete="email"
                  className="h-11 text-sm bg-slate-900/70 border-slate-600/60 text-slate-100 placeholder:text-slate-500"
                  placeholder={t.emailPlaceholder}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-white/90 text-sm block">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                    autoComplete="new-password"
                    className="h-11 text-sm bg-slate-900/70 border-slate-600/60 text-slate-100 placeholder:text-slate-500 pr-10"
                    placeholder={t.passwordPlaceholder}
                    aria-describedby={error ? 'signup-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? t.hidePassword : t.showPassword}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div id="signup-error" role="alert" className="flex items-center gap-2 bg-red-950/55 border border-red-700/45 text-red-300 text-xs rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitDisabled}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                style={buttonGradient}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                {t.createAccount}
              </button>
            </form>

            <div className="text-center text-xs text-slate-300/80">
              {t.alreadyHaveAccount}{' '}
              <Link href="/login" className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors">
                {t.signIn}
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/50 hover:bg-slate-700/70 text-slate-300 hover:text-slate-100 text-xs transition-all border border-slate-600/25 backdrop-blur-sm"
            >
              <Globe className="h-3 w-3 shrink-0" />
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}