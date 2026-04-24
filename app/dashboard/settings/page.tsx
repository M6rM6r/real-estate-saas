'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import type { Profile, Tenant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader as Loader2, Save, ExternalLink, Copy, Check } from 'lucide-react';

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    authFetch<ProfileResponse>('/api/dashboard/profile')
      .then((res) => {
        setData(res);
        setName(res.tenant.name);
        setEmail(res.profile.contact_email || '');
        setLogoUrl(res.profile.logo_url || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
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
          tenant: { name },
        }),
      });
      setSaved(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const slug = data?.tenant?.slug;
  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}` : null;

  const handleCopy = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:text-white shrink-0" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:text-white shrink-0" onClick={() => window.open(publicUrl, '_blank')}>
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
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#1a1a2e] border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Logo URL</Label>
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="bg-[#1a1a2e] border-gray-700 text-white"
            />
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
    </div>
  );
}
