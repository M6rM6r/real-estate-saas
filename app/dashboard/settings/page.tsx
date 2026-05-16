'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '@/lib/api';
import type { Profile, Tenant } from '@/lib/types';
import { isBillingPaid } from '@/lib/billing/paytabs';
import { getTenantTrialState } from '@/lib/billing/subscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader as Loader2, Save, ExternalLink, Copy, Check, Lock } from 'lucide-react';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { useLanguage } from '@/app/dashboard/LanguageContext';

const SETTINGS_T = {
  ar: {
    pageTitle: 'الإعدادات',
    unsavedBanner: 'لديك تغييرات غير محفوظة', saveNow: 'حفظ الآن',
    publicPageTitle: 'صفحتك العامة', publicPageDesc: 'شارك هذا الرابط مع عملائك — يعرض عروضك ومعلومات الاتصال والمزيد.',
    agencyProfileTitle: 'ملف الوكالة', agencyName: 'اسم الوكالة', contactEmail: 'بريد التواصل', logoUrl: 'رابط الشعار',
    savedBtn: 'تم الحفظ!', saveChanges: 'حفظ التغييرات',
    customDomainTitle: 'نطاق مخصص', customDomainDesc: 'وجّه نطاقك الخاص إلى صفحتك العامة.',
    yourDomain: 'نطاقك', dnsTitle: 'تعليمات إعداد ال DNS', dnsDesc: 'أضف سجل CNAME في مزود ال DNS:', dnsPropagation: 'قد يستغرق نشر التغييرات حتى 48 ساعة.',
    changePwdTitle: 'تغيير كلمة المرور', currentPwd: 'كلمة المرور الحالية', newPwd: 'كلمة المرور الجديدة', confirmPwd: 'تأكيد كلمة المرور الجديدة',
    allRequired: 'جميع الحقول مطلوبة', pwdMismatch: 'كلمتا المرور غير متطابقتين', pwdTooShort: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    notLoggedIn: 'المستخدم غير مسجل', pwdChanged: 'تم تغيير كلمة المرور بنجاح', error: 'خطأ', pwdFailed: 'فشل تغيير كلمة المرور',
  },
  en: {
    pageTitle: 'Settings',
    unsavedBanner: 'You have unsaved changes', saveNow: 'Save now',
    publicPageTitle: 'Your Public Page', publicPageDesc: 'Share this link with your clients — it shows your listings, contact info, and more.',
    agencyProfileTitle: 'Agency Profile', agencyName: 'Agency Name', contactEmail: 'Contact Email', logoUrl: 'Logo URL',
    savedBtn: 'Saved!', saveChanges: 'Save Changes',
    customDomainTitle: 'Custom Domain', customDomainDesc: 'Point your own domain to your public page.',
    yourDomain: 'Your Domain', dnsTitle: 'DNS Setup Instructions', dnsDesc: 'Add a CNAME record in your DNS provider pointing to this app:', dnsPropagation: 'Changes may take up to 48 hours to propagate globally.',
    changePwdTitle: 'Change Password', currentPwd: 'Current Password', newPwd: 'New Password', confirmPwd: 'Confirm New Password',
    allRequired: 'All fields are required', pwdMismatch: 'Passwords do not match', pwdTooShort: 'Password must be at least 8 characters',
    notLoggedIn: 'User not logged in', pwdChanged: 'Password changed successfully', error: 'Error', pwdFailed: 'Failed to change password',
  },
};

type ProfileResponse = {
  profile: Profile;
  tenant: Tenant & { primary_color: string };
  trial?: {
    isTrialConfigured: boolean;
    isTrialActive: boolean;
    isTrialExpired: boolean;
    daysLeft: number;
    expiresAt: string | null;
    subscriptionStatus: string;
  };
};

export default function SettingsPage() {
  const { lang } = useLanguage();
  const t = SETTINGS_T[lang];
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [origin, setOrigin] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [errors, setErrors] = useState<{ email?: string; logoUrl?: string }>({});
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const isDemo = typeof window !== 'undefined' && sessionStorage.getItem('demo_auth') === 'true';
  const isPaymentLockEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYMENT_LOCK === 'true'

  const refreshTenantBillingState = useCallback(async () => {
    const res = await authFetch<ProfileResponse>('/api/dashboard/profile')
    setData((prev) => {
      if (!prev) return res
      return {
        ...prev,
        tenant: {
          ...(prev.tenant ?? {}),
          ...(res.tenant ?? {}),
        } as ProfileResponse['tenant'],
      }
    })
    return res
  }, [])

  const isValidUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      const demoProfile: ProfileResponse = {
        profile: { contact_email: 'hello@luxuryhomesdubai.ae', logo_url: '', bio: '', contact_phone: '+971 4 000 0000', contact_address: 'Dubai Marina, Dubai, UAE' } as any,
        tenant: { name: 'Luxury Homes Dubai', slug: 'demo', primary_color: '#1d4ed8' } as any,
      };
      setData(demoProfile);
      setName(demoProfile.tenant.name);
      setEmail(demoProfile.profile.contact_email || '');
      setLogoUrl(demoProfile.profile.logo_url || '');
      setLoading(false);
      return;
    }
    authFetch<ProfileResponse>('/api/dashboard/profile')
      .then((res) => {
        setData(res);
        setName(res.tenant.name);
        setEmail(res.profile.contact_email || '');
        setLogoUrl(res.profile.logo_url || '');
        setCustomDomain(res.tenant.custom_domain || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isDemo) return

    const billingStatus = data?.tenant?.billing_status
    if (billingStatus !== 'pending') return

    let attempts = 0
    const maxAttempts = 8
    const interval = setInterval(() => {
      attempts += 1
      void refreshTenantBillingState()
        .then((res) => {
          if (isBillingPaid(res.tenant?.billing_status)) {
            toast({
              title: lang === 'ar' ? 'تم تفعيل الرابط' : 'URL unlocked',
              description: lang === 'ar' ? 'اكتملت عملية الدفع بنجاح.' : 'Payment completed successfully.',
            })
            clearInterval(interval)
          }
        })
        .catch(() => {})

      if (attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [data?.tenant?.billing_status, isDemo, lang, refreshTenantBillingState]);

  useEffect(() => {
    setOrigin('https://wa9l.website');
  }, []);

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsaved]);

  const handleSave = async () => {
    const nextErrors: { email?: string; logoUrl?: string } = {};
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (logoUrl.trim() && !isValidUrl(logoUrl.trim())) {
      nextErrors.logoUrl = 'Logo URL must start with http:// or https://';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setSaved(false);
    try {
      await authFetch('/api/dashboard/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          profile: {
            ...data?.profile,
            contact_email: email,
            logo_url: logoUrl,
          },
          tenant: { name, custom_domain: customDomain },
        }),
      });
      setSaved(true);
      setHasUnsaved(false);
      toast({ title: 'Saved', description: 'Settings updated successfully.' });
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e instanceof Error ? e.message : 'Unable to save settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-28 bg-gray-800" />
        <Card className="bg-[#12121a] border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-40 bg-gray-800" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full bg-gray-800" />
            <Skeleton className="h-10 w-full bg-gray-800" />
          </CardContent>
        </Card>
        <Card className="bg-[#12121a] border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-36 bg-gray-800" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full bg-gray-800" />
            <Skeleton className="h-16 w-full bg-gray-800" />
            <Skeleton className="h-16 w-full bg-gray-800" />
            <Skeleton className="h-10 w-36 bg-gray-800" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const slug = data?.tenant?.slug;
  const publicUrl = slug && origin ? `${origin}/${slug}` : null;
  const trialState = data?.trial ?? getTenantTrialState(data?.tenant ?? {} as any);
  const isTenantPaid = isBillingPaid(data?.tenant?.billing_status) || Boolean((data?.tenant as any)?.paid)
  const isUrlUnlocked = !isPaymentLockEnabled || isDemo || isTenantPaid || trialState.isTrialActive;

  const handleCopy = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUnlockUrls = async () => {
    setPaying(true);
    try {
      const res = await authFetch<{ checkoutUrl?: string; alreadyPaid?: boolean }>('/api/billing/paytabs/create-session', {
        method: 'POST',
      });

      if (res.alreadyPaid) {
        toast({
          title: lang === 'ar' ? 'الرابط مفعل بالفعل' : 'URL already unlocked',
          description: lang === 'ar' ? 'تم تفعيل صفحتك العامة.' : 'Your public page is already unlocked.',
        });
        return;
      }

      if (!res.checkoutUrl) {
        throw new Error(lang === 'ar' ? 'تعذر إنشاء رابط الدفع' : 'Unable to create payment link')
      }

      window.location.assign(res.checkoutUrl);
    } catch (error) {
      toast({
        title: lang === 'ar' ? 'تعذر بدء عملية الدفع' : 'Could not start payment',
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setPaying(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) {
      toast({ title: t.allRequired, variant: 'destructive' });
      return;
    }
    if (pwdForm.next !== pwdForm.confirm) {
      toast({ title: t.pwdMismatch, variant: 'destructive' });
      return;
    }
    if (pwdForm.next.length < 8) {
      toast({ title: t.pwdTooShort, variant: 'destructive' });
      return;
    }
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !user.email) {
      toast({ title: t.notLoggedIn, variant: 'destructive' });
      return;
    }
    setPwdSaving(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, pwdForm.current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, pwdForm.next);
      setPwdForm({ current: '', next: '', confirm: '' });
      toast({ title: t.pwdChanged });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t.pwdFailed;
      toast({ title: t.error, description: msg, variant: 'destructive' });
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{t.pageTitle}</h1>

      {/* Unsaved changes banner */}
      {hasUnsaved && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm">
          <span className="text-amber-300">{t.unsavedBanner}</span>
          <Button size="sm" onClick={handleSave} disabled={saving} aria-busy={saving} className="bg-amber-500 hover:bg-amber-400 text-black">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : t.saveNow}
          </Button>
        </div>
      )}

      {publicUrl && isUrlUnlocked && (
        <Card className="bg-[#12121a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">{t.publicPageTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-3">{t.publicPageDesc}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#1a1a2e] border border-gray-700 rounded-md px-3 py-2 text-sm text-blue-400 font-mono truncate">
                {publicUrl}
              </div>
              <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:text-white shrink-0" onClick={handleCopy} aria-label="Copy public page link">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:text-white shrink-0" onClick={() => window.open(publicUrl, '_blank')} aria-label="Open public page in new tab">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isDemo && trialState.isTrialActive && (
        <Card className="bg-[#12121a] border-blue-500/40">
          <CardHeader>
            <CardTitle className="text-lg text-blue-200">
              {lang === 'ar' ? 'فترة تجريبية فعّالة' : 'Trial is active'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-100/80">
              {lang === 'ar'
                ? `يتبقى ${trialState.daysLeft} يوم على انتهاء الفترة التجريبية.`
                : `${trialState.daysLeft} day(s) left in your trial.`}
            </p>
          </CardContent>
        </Card>
      )}

      {!isDemo && isPaymentLockEnabled && trialState.isTrialExpired && !isTenantPaid && (
        <Card className="bg-[#12121a] border-rose-500/40">
          <CardHeader>
            <CardTitle className="text-lg text-rose-200">
              {lang === 'ar' ? 'انتهت الفترة التجريبية' : 'Trial expired'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-rose-100/80">
              {lang === 'ar'
                ? 'للاستمرار ومشاركة رابط صفحتك العامة، أكمل الدفع الآن.'
                : 'To keep sharing your public page URL, complete payment now.'}
            </p>
            <Button onClick={handleUnlockUrls} disabled={paying} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {paying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {lang === 'ar' ? 'ادفع الآن' : 'Pay now'}
            </Button>
          </CardContent>
        </Card>
      )}

      {publicUrl && !isUrlUnlocked && (
        <Card className="bg-[#12121a] border-amber-600/40">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-200">
              <Lock className="h-5 w-5" />
              {lang === 'ar' ? 'رابط صفحتك العامة مخفي' : 'Your public page URL is hidden'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-amber-100/80">
              {lang === 'ar'
                ? 'ادفع مرة واحدة عبر PayTabs لإظهار الرابط وأزرار النسخ/الفتح.'
                : 'Complete a one-time PayTabs payment to reveal your URL and enable copy/open actions.'}
            </p>
            <Button onClick={handleUnlockUrls} disabled={paying} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {paying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {lang === 'ar' ? 'ادفع الآن' : 'Pay now'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#12121a] border-gray-800">
        <CardHeader>
            <CardTitle className="text-lg">{t.agencyProfileTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">{t.agencyName}</Label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setHasUnsaved(true); }}
              className="bg-[#1a1a2e] border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t.contactEmail}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
                setHasUnsaved(true);
              }}
              className="bg-[#1a1a2e] border-gray-700 text-white"
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t.logoUrl}</Label>
            <Input
              value={logoUrl}
              onChange={(e) => {
                setLogoUrl(e.target.value);
                setErrors((prev) => ({ ...prev, logoUrl: undefined }));
                setHasUnsaved(true);
              }}
              className="bg-[#1a1a2e] border-gray-700 text-white"
            />
            {errors.logoUrl && <p className="text-xs text-red-400">{errors.logoUrl}</p>}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saved ? t.savedBtn : t.saveChanges}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-[#12121a] border-gray-800">
        <CardHeader>
            <CardTitle className="text-lg">{t.customDomainTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400">{t.customDomainDesc}</p>
          <div className="space-y-2">
            <Label className="text-gray-300">{t.yourDomain}</Label>
            <Input
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="yourcompany.com"
              className="bg-[#1a1a2e] border-gray-700 text-white"
            />
          </div>
          <div className="bg-[#1a1a2e] border border-gray-700 rounded-md p-4 text-sm text-gray-400 space-y-2">
            <p className="font-semibold text-gray-300">{t.dnsTitle}</p>
            <p>{t.dnsDesc}</p>
            <code className="block bg-black/40 rounded px-3 py-2 text-green-400 text-xs font-mono">{`CNAME  @  →  ${origin || 'your-app.vercel.app'}`}</code>
            <p className="text-xs">{t.dnsPropagation}</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saved ? t.savedBtn : t.saveChanges}
          </Button>
        </CardContent>
      </Card>

      {!isDemo && (
        <Card className="bg-[#12121a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-4 w-4" /> {t.changePwdTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">{t.currentPwd}</Label>
              <Input
                type="password"
                value={pwdForm.current}
                onChange={(e) => setPwdForm((p) => ({ ...p, current: e.target.value }))}
                className="bg-[#1a1a2e] border-gray-700 text-white"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">{t.newPwd}</Label>
              <Input
                type="password"
                value={pwdForm.next}
                onChange={(e) => setPwdForm((p) => ({ ...p, next: e.target.value }))}
                className="bg-[#1a1a2e] border-gray-700 text-white"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">{t.confirmPwd}</Label>
              <Input
                type="password"
                value={pwdForm.confirm}
                onChange={(e) => setPwdForm((p) => ({ ...p, confirm: e.target.value }))}
                className="bg-[#1a1a2e] border-gray-700 text-white"
                autoComplete="new-password"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={pwdSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {pwdSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              {t.changePwdTitle}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
