'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, ArrowRight, Eye, EyeOff, Globe, AlertTriangle } from 'lucide-react';
import type { LoginBranding, LoginLang } from '@/lib/login-branding';

const translations: Record<LoginLang, {
  demoTitle: string;
  demoDesc: string;
  enterDemo: string;
  agencyLogin: string;
  email: string;
  password: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  login: string;
  hidePassword: string;
  showPassword: string;
  noAccountYet: string;
  createAccount: string;
}> = {
  ar: {
    demoTitle: 'جرّب النسخة التجريبية',
    demoDesc: 'استكشف لوحة التحكم كاملةً — العروض، وصفحة منشأتك — ببيانات تجريبية جاهزة.',
    enterDemo: 'ادخل التجربة',
    agencyLogin: 'تسجيل الدخول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    emailPlaceholder: 'you@agency.com',
    passwordPlaceholder: 'أدخل كلمة المرور',
    login: 'تسجيل الدخول',
    hidePassword: 'إخفاء كلمة المرور',
    showPassword: 'إظهار كلمة المرور',
    noAccountYet: 'ليس لديك حساب بعد؟',
    createAccount: 'إنشاء حساب',
  },
  en: {
    demoTitle: 'Try the Demo',
    demoDesc: 'Explore the full dashboard — listings, your business page — with ready demo data.',
    enterDemo: 'Enter Demo',
    agencyLogin: 'Agency Login',
    email: 'Email Address',
    password: 'Password',
    emailPlaceholder: 'you@agency.com',
    passwordPlaceholder: 'Enter your password',
    login: 'Sign In',
    hidePassword: 'Hide password',
    showPassword: 'Show password',
    noAccountYet: `Don't have an account yet?`,
    createAccount: 'Create account',
  },
}

export default function LoginClient({ branding }: { branding: LoginBranding }) {
  const router = useRouter();
  const [lang, setLangState] = useState<LoginLang>(branding.initialLang);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as LoginLang | null;
    if (savedLang === 'ar' || savedLang === 'en') setLangState(savedLang);
  }, []);

  const setLang = (newLang: LoginLang) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = translations[lang];
  const isRTL = lang === 'ar';

  const mapFirebaseError = (err: unknown, currentLang: LoginLang): string => {
    const code = (err as { code?: string })?.code ?? '';
    const messages: Record<string, { ar: string; en: string }> = {
      'auth/invalid-credential':     { ar: 'البريد أو كلمة المرور غير صحيحة', en: 'Invalid email or password' },
      'auth/invalid-email':          { ar: 'صيغة البريد الإلكتروني غير صحيحة', en: 'Invalid email format' },
      'auth/user-not-found':         { ar: 'البريد أو كلمة المرور غير صحيحة', en: 'Invalid email or password' },
      'auth/wrong-password':         { ar: 'البريد أو كلمة المرور غير صحيحة', en: 'Invalid email or password' },
      'auth/too-many-requests':      { ar: 'تم تجاوز عدد المحاولات، حاول لاحقاً', en: 'Too many attempts, try again later' },
      'auth/user-disabled':          { ar: 'هذا الحساب موقوف', en: 'This account is disabled' },
      'auth/network-request-failed': { ar: 'تحقق من اتصالك بالإنترنت', en: 'Check your internet connection' },
    };
    const entry = messages[code];
    if (entry) return entry[currentLang];
    if (err instanceof Error && err.message) return err.message;
    return currentLang === 'ar' ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, please try again';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { auth } = await import('@/lib/firebase');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Session creation failed');
      }
      sessionStorage.removeItem('demo_auth');
      document.cookie = 'demo_session=; path=/; max-age=0; SameSite=Lax';
      router.push('/dashboard');
    } catch (e: unknown) {
      setError(mapFirebaseError(e, lang));
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    sessionStorage.setItem('demo_auth', 'true');
    document.cookie = 'demo_session=1; path=/; max-age=86400; SameSite=Lax';
    router.push('/dashboard');
  };

  const buttonGradient = {
    background: `linear-gradient(135deg, ${branding.accentColor} 0%, #0ea5e9 100%)`,
    boxShadow: `0 14px 28px -14px ${branding.accentColor}88`,
  }

  return (
    <>
      <style>{`
        @keyframes wa9l-orb-a {
          0%,100% { transform: translateY(0) scale(1); opacity:.18; }
          50%      { transform: translateY(-28px) scale(1.06); opacity:.28; }
        }
        @keyframes wa9l-orb-b {
          0%,100% { transform: translateY(0) scale(1); opacity:.14; }
          50%      { transform: translateY(24px) scale(.94); opacity:.22; }
        }
        @keyframes wa9l-orb-c {
          0%,100% { transform:translate(0,0) scale(1); opacity:.09; }
          50%      { transform:translate(12px,-16px) scale(1.08); opacity:.15; }
        }
        @keyframes wa9l-fade-up {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .wa9l-orb-a { animation: wa9l-orb-a 9s ease-in-out infinite; }
        .wa9l-orb-b { animation: wa9l-orb-b 11s ease-in-out infinite; }
        .wa9l-orb-c { animation: wa9l-orb-c 13s ease-in-out infinite 1.5s; }
        .wa9l-f0 { animation: wa9l-fade-up .55s ease-out .05s both; }
        .wa9l-f1 { animation: wa9l-fade-up .55s ease-out .15s both; }
        .wa9l-f2 { animation: wa9l-fade-up .55s ease-out .25s both; }
        .wa9l-f3 { animation: wa9l-fade-up .55s ease-out .35s both; }
        .wa9l-f4 { animation: wa9l-fade-up .55s ease-out .45s both; }
        .wa9l-glass {
          background: rgba(8,8,22,.80);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
      `}</style>

      <div className="relative min-h-[100dvh] overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url('${branding.backgroundImage}')` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-violet-950/15 pointer-events-none" aria-hidden="true" />

        <div
          aria-hidden="true"
          className="wa9l-orb-a absolute -top-28 -left-28 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none opacity-40"
          style={{ backgroundColor: branding.accentColor }}
        />
        <div aria-hidden="true" className="wa9l-orb-b absolute -bottom-28 -right-28 w-[540px] h-[540px] bg-violet-600 rounded-full blur-[140px] pointer-events-none opacity-35" />
        <div aria-hidden="true" className="wa9l-orb-c absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500 rounded-full blur-[90px] pointer-events-none opacity-25" />

        <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="w-full max-w-[460px] space-y-3 sm:space-y-4">
            <div className="flex flex-col items-center gap-2 pb-1">
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
              {branding.tenantBadge && (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200/80 backdrop-blur-sm">
                  {branding.tenantBadge}
                </span>
              )}
              <p className="text-slate-300/80 text-sm text-center">{branding.brandSubtitle}</p>
            </div>

            <div className="rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5" style={{ background: 'rgba(6,6,20,0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: `0 0 0 1px ${branding.accentColor}26` }}>
              <div className="text-center">
                <h2 className="text-base font-bold text-white drop-shadow">{t.agencyLogin}</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="wa9l-email" className="text-white/90 text-sm drop-shadow block">{t.email}</Label>
                  <Input
                    id="wa9l-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    autoComplete="email"
                    className="h-11 text-sm bg-slate-900/70 border-slate-600/60 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/55 transition-colors"
                    placeholder={t.emailPlaceholder}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wa9l-password" className="text-white/90 text-sm drop-shadow block">{t.password}</Label>
                  <div className="relative">
                    <Input
                      id="wa9l-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      dir="ltr"
                      autoComplete="current-password"
                      className="h-11 text-sm bg-slate-900/70 border-slate-600/60 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/55 transition-colors pr-10"
                      placeholder={t.passwordPlaceholder}
                      aria-describedby={error ? 'wa9l-login-error' : undefined}
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
                  <div id="wa9l-login-error" role="alert" className="flex items-center gap-2 bg-red-950/55 border border-red-700/45 text-red-300 text-xs rounded-lg px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  style={buttonGradient}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                  {t.login}
                </button>

                <div className="text-center text-xs text-slate-300/80">
                  {t.noAccountYet}{' '}
                  <Link href="/signup" className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors">
                    {t.createAccount}
                  </Link>
                </div>
              </form>
            </div>

            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: `${branding.accentColor}16`, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }} />
              <div className="relative px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-slate-100">{t.demoTitle}</h2>
                  <p className="text-indigo-200/70 text-xs mt-0.5 leading-relaxed">{t.demoDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={handleDemo}
                  className="group w-full sm:w-auto justify-center sm:justify-start shrink-0 flex items-center gap-1.5 bg-slate-900/60 hover:bg-slate-900/80 text-slate-100 font-semibold text-xs py-2.5 px-3.5 rounded-xl border transition-all duration-200 active:scale-[0.97] backdrop-blur-sm whitespace-nowrap"
                  style={{ borderColor: `${branding.accentColor}55` }}
                >
                  <ArrowRight className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 ${isRTL ? 'rotate-180' : ''}`} />
                  {t.enterDemo}
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 px-0.5">
              <p className="text-slate-600/70 text-[11px] text-center sm:text-start">{branding.footer}</p>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLang(lang === 'ar' ? 'en' : 'ar'); }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/50 hover:bg-slate-700/70 text-slate-400 hover:text-slate-200 text-xs transition-all border border-slate-600/25 backdrop-blur-sm"
              >
                <Globe className="h-3 w-3 shrink-0" />
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}