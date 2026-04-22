'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'

const navItems = [
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/listings', label: 'Listings' },
  { href: '/dashboard/news', label: 'News' },
  { href: '/dashboard/gallery', label: 'Gallery' },
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/login')
    })
    return () => unsub()
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h1 className="text-xl font-bold mb-8">Dashboard</h1>
        <nav className="space-y-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`block py-2 px-4 rounded ${pathname === item.href ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="block py-2 px-4 rounded hover:bg-gray-700 w-full text-left"
          >
            Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}