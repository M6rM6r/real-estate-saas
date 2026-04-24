'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader as Loader2, Building2, Eye } from 'lucide-react';

export default function LoginPage() {
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
      const { auth } = await import('@/lib/firebase');
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error('Session creation failed');
      router.push('/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    sessionStorage.setItem('demo_auth', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0d1b3e] via-[#1a2f5a] to-[#0a0a1f]">
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
            <span className="font-bold text-xl tracking-tight">RealEstate SaaS</span>
          </div>
          <div>
            <blockquote className="text-4xl font-bold leading-tight mb-4">
              &ldquo;Your properties.<br />Your brand.<br />Your clients.&rdquo;
            </blockquote>
            <p className="text-blue-300 text-sm">The all-in-one platform for modern real estate agencies.</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-[#0a0a0f] flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-[#12121a] border-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Agency Login</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to manage your real estate listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1a1a2e] border-gray-700 text-white placeholder:text-gray-500"
                  placeholder="you@agency.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1a1a2e] border-gray-700 text-white placeholder:text-gray-500"
                  placeholder="Enter your password"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#12121a] px-3 text-gray-500">or</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleDemo}
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Eye className="mr-2 h-4 w-4" />
              Enter Demo Mode
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
