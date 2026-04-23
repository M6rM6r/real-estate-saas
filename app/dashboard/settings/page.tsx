'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

type DayHours = { enabled: boolean; open: string; close: string }

function defaultHours(): Record<string, DayHours> {
  return Object.fromEntries(DAYS.map(d => [d, {
    enabled: d !== 'sun',
    open: '09:00',
    close: '18:00',
  }]))
}

async function getToken() {
  return auth.currentUser?.getIdToken() ?? null
}

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  
  const [hours, setHours] = useState<Record<string, DayHours>>(defaultHours())
  const [savingHours, setSavingHours] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch initial hours
  useEffect(() => {
    const fetchSettings = async () => {
      const token = await getToken()
      if (!token) return
      const res = await fetch('/api/dashboard/profile', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        if (data.working_hours) {
          setHours(data.working_hours)
        }
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return setPasswordMsg('Passwords do not match')
    if (newPassword.length < 8) return setPasswordMsg('Password must be at least 8 characters')
    
    setSavingPassword(true)
    const token = await getToken()
    if (!token) {
        setSavingPassword(false)
        return
    }
    
    // Using API route for password update assuming Firebase Admin handles it via /api/auth/password 
    // Or doing it directly via Firebase client SDK if they logged in with Password
    setPasswordMsg('Password updates should be done via Firebase Auth client. (Implementation stubbed)')
    setSavingPassword(false)
  }

  const handleSaveHours = async () => {
    setSavingHours(true)
    const token = await getToken()
    if (!token) { setSavingHours(false); return }
    await fetch('/api/dashboard/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ working_hours: hours }),
    })
    setSavingHours(false)
  }

  const toggleDay = (day: string) => {
    setHours(h => ({ ...h, [day]: { ...h[day], enabled: !h[day].enabled } }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-neon-green font-mono animate-pulse text-glow">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-mono font-bold text-neon-green tracking-wider text-glow mb-2">AGENCY SETTINGS</h1>
        <p className="text-gray-400 font-mono text-sm">Manage authentication, operational hours, and system preferences.</p>
      </div>

      <section className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-mono text-white mb-6 border-b border-white/10 pb-4">Security Credentials</h2>
        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">New Password</label>
            <input type="password" required minLength={8} value={newPassword}
              onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters"
              className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:bg-black/60 focus:ring-1 focus:ring-neon-green transition-all placeholder:text-gray-600 backdrop-blur-md" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Confirm Password</label>
            <input type="password" required value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
              className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-neon-green focus:bg-black/60 focus:ring-1 focus:ring-neon-green transition-all placeholder:text-gray-600 backdrop-blur-md" />
          </div>
          {passwordMsg && (
            <p className={`text-sm font-mono p-3 rounded-lg bg-black/50 border ${passwordMsg.includes('success') ? 'text-neon-green border-neon-green/30' : 'text-red-400 border-red-500/30'}`}>
                {passwordMsg}
            </p>
          )}
          <button type="submit" disabled={savingPassword}
            className="bg-neon-green/90 text-black font-mono font-bold px-6 py-2.5 rounded-lg hover:bg-neon-green hover:shadow-[0_0_15px_rgba(0,255,65,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {savingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </section>

      <section className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-mono text-white mb-6 border-b border-white/10 pb-4">Operational Hours</h2>
        <div className="space-y-4 max-w-2xl">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <button type="button" onClick={() => toggleDay(day)}
                className={`w-24 text-xs font-mono py-2 rounded-lg transition-all duration-300 font-bold tracking-wider uppercase
                ${hours[day].enabled 
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/30 shadow-[0_0_10px_rgba(0,255,65,0.1)]' 
                    : 'bg-black text-gray-500 border border-white/10 hover:text-gray-300'}`}>
                {DAY_LABELS[day].slice(0, 3)}
              </button>
              
              {hours[day].enabled ? (
                <div className="flex items-center gap-4 flex-1">
                  <input type="time" value={hours[day].open}
                    onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], open: e.target.value } }))}
                    className="bg-black border border-white/10 focus:border-neon-green rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:outline-none transition-colors" />
                  <span className="text-gray-500 font-mono text-xs uppercase">Until</span>
                  <input type="time" value={hours[day].close}
                    onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], close: e.target.value } }))}
                    className="bg-black border border-white/10 focus:border-neon-green rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:outline-none transition-colors" />
                </div>
              ) : (
                <span className="text-sm font-mono text-gray-600 uppercase tracking-widest flex-1">Closed</span>
              )}
            </div>
          ))}
        </div>
        <button onClick={handleSaveHours} disabled={savingHours}
          className="mt-8 bg-neon-green/90 text-black font-mono font-bold px-8 py-3 rounded-lg hover:bg-neon-green hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest">
          {savingHours ? 'SAVING...' : 'SAVE HOURS CONFIGURATION'}
        </button>
      </section>

      <section className="border border-red-500/20 rounded-2xl p-8 bg-red-950/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full pointer-events-none" />
        <h2 className="text-xl font-mono text-red-500 mb-2 font-bold tracking-wider">DANGER ZONE</h2>
        <p className="font-mono text-sm text-red-400/70 mb-6">Contact your super administrator to permanently delete your account or agency data.</p>
        <button disabled className="text-sm font-mono font-bold tracking-widest uppercase text-red-500 border border-red-500/30 px-6 py-3 rounded-lg opacity-50 cursor-not-allowed bg-red-500/5">
          SYSTEM PURGE (RESTRICTED)
        </button>
      </section>
    </div>
  )
}
