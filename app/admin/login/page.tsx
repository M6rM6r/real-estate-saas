'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader as Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      router.push('/admin/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4 font-mono">
      <Card className="w-full max-w-md bg-[#111] border-[#00ff41]/30">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-[#00ff41]/10 border border-[#00ff41]/30 flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-[#00ff41]" />
          </div>
          <CardTitle className="text-2xl text-[#00ff41]">Admin Terminal</CardTitle>
          <CardDescription className="text-[#00ff41]/60">
            Super admin access required
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#00ff41]/80">
                {'>'} Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0c0c0c] border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/30 font-mono"
                placeholder="admin@domain.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#00ff41]/80">
                {'>'} Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0c0c0c] border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/30 font-mono"
                placeholder="********"
              />
            </div>
            {error && (
              <p className="text-sm text-red-400 font-mono">[ERROR] {error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00ff41] hover:bg-[#00ff41]/80 text-[#0c0c0c] font-bold font-mono"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {'>'} AUTHENTICATE
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
