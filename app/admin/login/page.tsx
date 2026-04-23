'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Icons
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0 20.117 20.117 0 003.553-1.093 20.068 20.068 0 005.596-4.084 12.633 12.633 0 002.091-7.175.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" clipRule="evenodd" />
  </svg>
)

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
  </svg>
)

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
)

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
)

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        router.push('/admin/dashboard')
      } else {
        const data = await res.json()
        setError(data.error ?? 'Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="w-full max-w-md p-8 rounded-2xl glass-panel border-t border-[#00ff41]/20">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-neon-green/10 border border-neon-green/30 mb-4 text-neon-green shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <ShieldIcon />
          </div>
          <h1 className="font-mono text-neon-green text-2xl font-bold tracking-wider mb-1 text-glow">
            SUPER ADMIN
          </h1>
          <p className="text-gray-400 font-mono text-sm">Developer access only</p>
        </div>
          
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-green transition-colors">
                <MailIcon />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-neon-green focus:bg-black/60 focus:ring-1 focus:ring-neon-green transition-all placeholder:text-gray-600 backdrop-blur-md"
                placeholder="admin@domain.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Password</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-green transition-colors">
                <LockIcon />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-neon-green focus:bg-black/60 focus:ring-1 focus:ring-neon-green transition-all placeholder:text-gray-600 backdrop-blur-md"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 animate-pulse">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-green/90 text-black font-mono font-bold py-3 rounded-lg hover:bg-neon-green hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                AUTHENTICATING...
              </>
            ) : (
              'ACCESS SYSTEM'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center pt-6 border-t border-white/5">
          <p className="text-xs text-gray-500 font-mono flex items-center justify-center gap-2">
            <LockIcon /> Protected by JWT encyption
          </p>
        </div>
      </div>
    </div>
  )
}