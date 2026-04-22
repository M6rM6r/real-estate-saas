'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateTenant() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, email, tempPassword })
    })
    if (res.ok) {
      router.push('/admin/tenants')
    } else {
      alert('Error creating tenant')
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Create Agency</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Agency Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 border"
        />
        <input
          type="text"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className="w-full p-2 border"
        />
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border"
        />
        <input
          type="password"
          placeholder="Temp Password"
          value={tempPassword}
          onChange={(e) => setTempPassword(e.target.value)}
          required
          className="w-full p-2 border"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
      </form>
    </div>
  )
}