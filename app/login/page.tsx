'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader as Loader2, Building2, Sparkles, ArrowRight, Eye, EyeOff, Globe } from 'lucide-react';

type Lang = 'ar' | 'en';

const translations = {
  ar: {
    tagline: '"عروضك.\nعلامتك.\nعملاؤك."',
    subtitle: 'المنصة الاحترافية لإدارة صفحات الأعمال الحديثة.',
    demoBadge: 'معاينة مجانية',
    noAccount: 'لا حاجة لحساب',
    demoTitle: 'جرّب النسخة التجريبية',
    demoDesc: 'استكشف لوحة التحكم كاملةً — العروض، وصفحة منشأتك — ببيانات تجريبية جاهزة.',
    enterDemo: 'ادخل التجربة',
    agencyLogin: 'تسجيل دخول الوكالة',
    haveAccount: 'هل لديك حساب؟ سجّل دخولك أدناه.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    emailPlaceholder: 'you@agency.com',
    passwordPlaceholder: 'أدخل كلمة المرور',
    login: 'تسجيل الدخول',
    hidePassword: 'إخفاء كلمة المرور',
    showPassword: 'إظهار كلمة المرور',
    loginFailed: 'Login failed',
  },
  en: {
    tagline: '"Your Listings.\nYour Brand.\nYour Clients."',
    subtitle: 'The professional platform for managing modern business pages.',
    demoBadge: 'Free Preview',
    noAccount: 'No account needed',
    demoTitle: 'Try the Demo',
    demoDesc: 'Explore the full dashboard — listings, your business page — with ready demo data.',
    enterDemo: 'Enter Demo',
    agencyLogin: 'Agency Login',
    haveAccount: 'Have an account? Sign in below.',
    email: 'Email Address',
    password: 'Password',
    emailPlaceholder: 'you@agency.com',
    passwordPlaceholder: 'Enter your password',
    login: 'Sign In',
    hidePassword: 'Hide password',
    showPassword: 'Show password',
    loginFailed: 'Login failed',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('ar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const t = translations[lang];
  const isRTL = lang === 'ar';

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
        throw new Error(data.error ?? 'Session creation failed');
      }
      router.push('/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    sessionStorage.setItem('demo_auth', 'true');
    // Set a short-lived cookie so the middleware lets demo users through
    document.cookie = 'demo_session=1; path=/; max-age=86400; SameSite=Lax';
    router.push('/dashboard');
  };

  return (
    /* Outer flex keeps LTR so decorative panel stays visually on the left */
    <div className="min-h-screen flex" dir="ltr">
      {/* Left decorative panel */}
      <div aria-hidden="true" className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0d1b3e] via-[#1a2f5a] to-[#0a0a1f]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b3e]/80 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Rew</span>
          </div>
          <div>
            <blockquote className="text-4xl font-bold leading-tight mb-4 whitespace-pre-line" dir={isRTL ? 'rtl' : 'ltr'}>
              &ldquo;{t.tagline.replace(/"/g, '').replace(/\n/g, '.\n')}&rdquo;
            </blockquote>
            <p className="text-blue-300 text-sm" dir={isRTL ? 'rtl' : 'ltr'}>{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-[#0a0a0f] flex items-center justify-center px-4 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md space-y-6">

          {/* ── Language Toggle ── */}
          <div className="flex justify-end">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
            >
              <Globe className="h-4 w-4" />
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          {/* ── Demo CTA ── */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-600 via-indigo-600 to-violet-700 opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" /> {t.demoBadge}
                </span>
                <span className="text-white/60 text-xs">{t.noAccount}</span>
              </div>
              <h2 className="text-xl font-bold mb-1">{t.demoTitle}</h2>
              <p className="text-white/70 text-sm mb-5 leading-relaxed">
                {t.demoDesc}
              </p>
              <button
                type="button"
                onClick={handleDemo}
                className="group flex items-center justify-center gap-2 w-full bg-white text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg shadow-indigo-900/40 active:scale-[0.98]"
              >
                <ArrowRight className={`h-4 w-4 group-hover:-translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                {t.enterDemo}
                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>

          {/* ── Sign-in form ── */}
          <Card className="bg-[#12121a] border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-white">{t.agencyLogin}</CardTitle>
              <CardDescription className="text-gray-500 text-sm">
                {t.haveAccount}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 block">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    className="bg-[#1a1a2e] border-gray-700 text-white placeholder:text-gray-500 text-left"
                    placeholder={t.emailPlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 block">{t.password}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      dir="ltr"
                      className="bg-[#1a1a2e] border-gray-700 text-white placeholder:text-gray-500 text-left pr-10"
                      placeholder={t.passwordPlaceholder}
                      aria-describedby={error ? 'login-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                      aria-label={showPassword ? t.hidePassword : t.showPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p id="login-error" role="alert" className="text-sm text-red-400">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  {t.login}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
