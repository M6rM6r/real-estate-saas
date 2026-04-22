'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

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

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [hours, setHours] = useState<Record<string, DayHours>>(defaultHours())
  const [savingHours, setSavingHours] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return setPasswordMsg('Passwords do not match')
    if (newPassword.length < 8) return setPasswordMsg('Password must be at least 8 characters')
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) setPasswordMsg(error.message)
    else {
      setPasswordMsg('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleSaveHours = async () => {
    setSavingHours(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSavingHours(false); return }
    await fetch('/api/dashboard/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ working_hours: hours }),
    })
    setSavingHours(false)
  }

  const toggleDay = (day: string) => {
    setHours(h => ({ ...h, [day]: { ...h[day], enabled: !h[day].enabled } }))
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" required minLength={8} value={newPassword}
              onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" required value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{passwordMsg}</p>
          )}
          <button type="submit" disabled={savingPassword}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Working Hours</h2>
        <div className="space-y-3">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-4">
              <button type="button" onClick={() => toggleDay(day)}
                className={`w-16 text-xs font-medium py-1 px-2 rounded transition-colors ${hours[day].enabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                {DAY_LABELS[day].slice(0, 3)}
              </button>
              {hours[day].enabled ? (
                <div className="flex items-center gap-2">
                  <input type="time" value={hours[day].open}
                    onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], open: e.target.value } }))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm" />
                  <span className="text-gray-400 text-xs">to</span>
                  <input type="time" value={hours[day].close}
                    onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], close: e.target.value } }))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm" />
                </div>
              ) : (
                <span className="text-sm text-gray-400">Closed</span>
              )}
            </div>
          ))}
        </div>
        <button onClick={handleSaveHours} disabled={savingHours}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {savingHours ? 'Saving...' : 'Save Hours'}
        </button>
      </section>

      <section className="border border-red-200 rounded-xl p-6 bg-red-50">
        <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-4">Contact your administrator to delete your account or agency.</p>
        <button disabled className="text-sm text-red-400 border border-red-300 px-4 py-2 rounded-lg opacity-50 cursor-not-allowed">
          Delete Agency
        </button>
      </section>
    </div>
  )
}
