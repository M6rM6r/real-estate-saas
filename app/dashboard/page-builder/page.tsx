'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import type { Profile, Tenant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader as Loader2, ExternalLink, Copy, Check, Phone, Mail, MapPin, Instagram, Twitter, Linkedin, MessageCircle } from 'lucide-react';

type ProfileResponse = {
  profile: Profile;
  tenant: Tenant & { primary_color: string };
};

export default function PageBuilderPage() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    tenant_id: '',
    logo_url: '',
    cover_url: '',
    bio: '',
    tagline: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    social_links: { instagram: '', x: '', linkedin: '', whatsapp: '' },
  });
  const [primaryColor, setPrimaryColor] = useState('#2563eb');

  useEffect(() => {
    authFetch<ProfileResponse>('/api/dashboard/profile')
      .then((res) => {
        setData(res);
        if (res.profile) setProfile(res.profile);
        setPrimaryColor(res.tenant?.primary_color || '#2563eb');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authFetch('/api/dashboard/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          profile,
          tenant: { primary_color: primaryColor },
        }),
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/${data?.tenant.slug || ''}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateSocial = (key: string, value: string) => {
    setProfile({
      ...profile,
      social_links: { ...profile.social_links, [key]: value },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${data?.tenant.slug || ''}`;

  return (
    <div className="space-y-6">
      {/* Public URL Banner */}
      <div className="bg-[#12121a] border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-1">Your Public Page</p>
          <p className="text-blue-400 font-mono text-sm truncate">{publicUrl}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="border-gray-700 text-gray-300"
          >
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300"
            >
              <ExternalLink className="h-4 w-4 mr-1" /> Open Page
            </Button>
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Editor */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="branding">
            <TabsList className="bg-[#12121a] border-gray-800">
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>

            <TabsContent value="branding" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Primary Color</Label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 rounded border border-gray-700 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="bg-[#1a1a2e] border-gray-700 text-white w-32"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Logo URL</Label>
                <Input
                  value={profile.logo_url || ''}
                  onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Cover Image URL</Label>
                <Input
                  value={profile.cover_url || ''}
                  onChange={(e) => setProfile({ ...profile, cover_url: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Tagline</Label>
                <Input
                  value={profile.tagline || ''}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Bio</Label>
                <Textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={5}
                  className="bg-[#1a1a2e] border-gray-700 text-white resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <Input
                  value={profile.contact_email || ''}
                  onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Phone</Label>
                <Input
                  value={profile.contact_phone || ''}
                  onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Address</Label>
                <Input
                  value={profile.contact_address || ''}
                  onChange={(e) => setProfile({ ...profile, contact_address: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Instagram</Label>
                <Input
                  value={profile.social_links?.instagram || ''}
                  onChange={(e) => updateSocial('instagram', e.target.value)}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">X (Twitter)</Label>
                <Input
                  value={profile.social_links?.x || ''}
                  onChange={(e) => updateSocial('x', e.target.value)}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">LinkedIn</Label>
                <Input
                  value={profile.social_links?.linkedin || ''}
                  onChange={(e) => updateSocial('linkedin', e.target.value)}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">WhatsApp</Label>
                <Input
                  value={profile.social_links?.whatsapp || ''}
                  onChange={(e) => updateSocial('whatsapp', e.target.value)}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 bg-blue-600 hover:bg-blue-700"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2">
          <Card className="bg-[#12121a] border-gray-800 sticky top-4">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border border-gray-700 bg-white">
                {/* Preview Hero */}
                <div className="relative h-32 overflow-hidden">
                  {profile.cover_url ? (
                    <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700" />
                  )}
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    {profile.logo_url && (
                      <img
                        src={profile.logo_url}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover mb-2 border border-white/30"
                      />
                    )}
                    <p className="font-bold text-sm">{data?.tenant.name}</p>
                    {profile.tagline && (
                      <p className="text-xs text-white/70 mt-0.5">{profile.tagline}</p>
                    )}
                  </div>
                </div>
                {/* Preview About */}
                <div className="p-3">
                  <p className="text-xs font-semibold mb-1" style={{ color: primaryColor }}>
                    About Us
                  </p>
                  <p className="text-gray-600 text-xs line-clamp-3">
                    {profile.bio || 'No bio yet.'}
                  </p>
                  <div className="mt-2 space-y-1">
                    {profile.contact_phone && (
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Phone className="h-3 w-3" style={{ color: primaryColor }} />
                        {profile.contact_phone}
                      </div>
                    )}
                    {profile.contact_email && (
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Mail className="h-3 w-3" style={{ color: primaryColor }} />
                        {profile.contact_email}
                      </div>
                    )}
                    {profile.contact_address && (
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <MapPin className="h-3 w-3" style={{ color: primaryColor }} />
                        {profile.contact_address}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {profile.social_links?.whatsapp && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                        <MessageCircle className="h-3 w-3" />
                      </div>
                    )}
                    {profile.social_links?.instagram && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                        <Instagram className="h-3 w-3" />
                      </div>
                    )}
                    {profile.social_links?.x && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                        <Twitter className="h-3 w-3" />
                      </div>
                    )}
                    {profile.social_links?.linkedin && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                        <Linkedin className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
