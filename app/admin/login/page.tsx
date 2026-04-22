'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c]">
      <div className="w-full max-w-md p-8 rounded-xl border border-[#00ff41]/20 bg-[#111]">
        <div className="mb-8 text-center">
          <span className="font-mono text-[#00ff41] text-2xl font-bold tracking-wider">
            SUPER ADMIN
          </span>
          <p className="text-gray-500 font-mono text-sm mt-1">Developer access only</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 text-white font-mono rounded px-3 py-2 focus:outline-none focus:border-[#00ff41] transition-colors"
              placeholder="admin@domain.com"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">PASSWORD</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 text-white font-mono rounded px-3 py-2 focus:outline-none focus:border-[#00ff41] transition-colors"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm font-mono">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00ff41] text-black font-mono font-bold py-2 rounded hover:bg-[#00cc34] transition-colors disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
          </button>
        </form>
      </div>
    </div>
  )
}