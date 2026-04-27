'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import type { Profile, Tenant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader as Loader2, Save, ExternalLink, Copy, Check, Lock } from 'lucide-react';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

type ProfileResponse = {
  profile: Profile;
  tenant: Tenant & { primary_color: string };
};

export default function SettingsPage() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [errors, setErrors] = useState<{ email?: string; logoUrl?: string }>({});
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const isDemo = typeof window !== 'undefined' && sessionStorage.getItem('demo_auth') === 'true';

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
        tenant: { name: 'Luxury Homes Dubai', slug: 'luxury-homes-dubai', primary_color: '#1d4ed8' } as any,
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
    setOrigin(window.location.origin);
  }, []);

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

  const handleCopy = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChangePassword = async () => {
    if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) {
      toast({ title: 'جميع الحقول مطلوبة', variant: 'destructive' });
      return;
    }
    if (pwdForm.next !== pwdForm.confirm) {
      toast({ title: 'كلمتا المرور غير متطابقتين', variant: 'destructive' });
      return;
    }
    if (pwdForm.next.length < 8) {
      toast({ title: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل', variant: 'destructive' });
      return;
    }
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !user.email) {
      toast({ title: 'المستخدم غير مسجل', variant: 'destructive' });
      return;
    }
    setPwdSaving(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, pwdForm.current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, pwdForm.next);
      setPwdForm({ current: '', next: '', confirm: '' });
      toast({ title: 'تم تغيير كلمة المرور بنجاح' });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'فشل تغيير كلمة المرور';
      toast({ title: 'خطأ', description: msg, variant: 'destructive' });
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {publicUrl && (
        <Card className="bg-[#12121a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Your Public Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-3">Share this link with your clients — it shows your listings, contact info, and more.</p>
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

      <Card className="bg-[#12121a] border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Agency Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Agency Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#1a1a2e] border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Contact Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className="bg-[#1a1a2e] border-gray-700 text-white"
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Logo URL</Label>
            <Input
              value={logoUrl}
              onChange={(e) => {
                setLogoUrl(e.target.value);
                setErrors((prev) => ({ ...prev, logoUrl: undefined }));
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
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-[#12121a] border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Custom Domain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400">Point your own domain to your public page.</p>
          <div className="space-y-2">
            <Label className="text-gray-300">Your Domain</Label>
            <Input
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="yourcompany.com"
              className="bg-[#1a1a2e] border-gray-700 text-white"
            />
          </div>
          <div className="bg-[#1a1a2e] border border-gray-700 rounded-md p-4 text-sm text-gray-400 space-y-2">
            <p className="font-semibold text-gray-300">DNS Setup Instructions</p>
            <p>Add a CNAME record in your DNS provider pointing to this app:</p>
            <code className="block bg-black/40 rounded px-3 py-2 text-green-400 text-xs font-mono">{`CNAME  @  →  ${origin || 'your-app.vercel.app'}`}</code>
            <p className="text-xs">Changes may take up to 48 hours to propagate globally.</p>
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
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {!isDemo && (
        <Card className="bg-[#12121a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-4 w-4" /> تغيير كلمة المرور
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">كلمة المرور الحالية</Label>
              <Input
                type="password"
                value={pwdForm.current}
                onChange={(e) => setPwdForm((p) => ({ ...p, current: e.target.value }))}
                className="bg-[#1a1a2e] border-gray-700 text-white"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">كلمة المرور الجديدة</Label>
              <Input
                type="password"
                value={pwdForm.next}
                onChange={(e) => setPwdForm((p) => ({ ...p, next: e.target.value }))}
                className="bg-[#1a1a2e] border-gray-700 text-white"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">تأكيد كلمة المرور الجديدة</Label>
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
              تغيير كلمة المرور
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
