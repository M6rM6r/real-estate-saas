'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'

// Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
)
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.006 3.705a.75.75 0 00-.512-1.41L6 6.838V3a.75.75 0 00-.75-.75h-1.5A.75.75 0 003 3v4.93l-1.006.365a.75.75 0 00.512 1.41l16.5-6z" /><path fillRule="evenodd" d="M3.019 11.115L18 5.667V9.09l4.006 1.456a.75.75 0 11-.512 1.41l-16.5-6a.75.75 0 01-.025-1.419zM18 11.093V19a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19V9.09l13.5 4.907z" clipRule="evenodd" /></svg>
)
const NewspaperIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 003 3h15a3 3 0 003-3v-4.5c0-1.036-.84-1.875-1.875-1.875h-1.5c-.621 0-1.125.504-1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H15a1.125 1.125 0 01-1.125-1.125V9.75c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H4.125zM12 9.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12 12.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /><path d="M16.5 9.75v-3a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h15a.75.75 0 00.75-.75z" /></svg>
)
const MegaphoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16.881 4.346A23.112 23.112 0 018.25 6.75c-1.175 0-2.324.18-3.428.527C3.912 7.89 2.25 9.75 2.25 12c0 2.25 1.662 4.11 3.872 4.723.492.135.996.24 1.51.315a23.027 23.027 0 018.215-.957c2.252.448 4.247 2.078 5.5 4.25a.75.75 0 001.31-.764c-1.51-2.736-3.87-4.75-6.565-5.358a24.522 24.522 0 00-3.127-.483 23.112 23.112 0 00-5.284-.217C4.257 13.28 3 10.51 3 8.25 3 5.978 4.257 3.21 6.75 2.036c.329-.143.67-.26 1.022-.35A24.527 24.527 0 008.25 1.5c4.517 0 8.69 1.721 11.804 4.53a.75.75 0 00.997-1.12 24.586 24.586 0 00-7.17-4.188z" /><path d="M9.75 9a.75.75 0 000 1.5h.634l.262 5.25H9.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-.346l.262-5.25H15a.75.75 0 000-1.5h-5.25z" /></svg>
)
const PhotoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .138.112.25.25.25h16.5A.25.25 0 0020 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" /></svg>
)
const InboxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6.912 3a.75.75 0 01.747.648l.529 3.644 8.85-3.553a.75.75 0 011.03.78l-.47 8.262a.75.75 0 01-.735.69H3.166l.578 8.5h17.016a.75.75 0 010 1.5H3.092a.75.75 0 01-.748-.648l-1-14.5a.75.75 0 01.648-.842L6.912 3zm9.35 5.37L9.54 11.64l-.296 2.988 7.018-6.258z" clipRule="evenodd" /><path d="M12.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zM12 18.75a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>
)
const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" /></svg>
)
const CogIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M11.078 2.25c-.916 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.818l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.113.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.818l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.6.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.115.043-.283.031-.45-.082a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" /></svg>
)
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H3a.75.75 0 010-1.5h8.69l-1.72-1.72a.75.75 0 011.06-1.06l3 3z" clipRule="evenodd" /></svg>
)
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
)
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
)

const navItems = [
  { href: '/dashboard/profile', label: 'Profile', icon: UserIcon },
  { href: '/dashboard/listings', label: 'Listings', icon: HomeIcon },
  { href: '/dashboard/page-builder', label: 'Page Builder', icon: CogIcon },
  { href: '/dashboard/news', label: 'News', icon: NewspaperIcon },
  { href: '/dashboard/announcements', label: 'Announcements', icon: MegaphoneIcon },
  { href: '/dashboard/gallery', label: 'Gallery', icon: PhotoIcon },
  { href: '/dashboard/leads', label: 'Leads', icon: InboxIcon },
  { href: '/dashboard/analytics', label: 'Analytics', icon: ChartIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: CogIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }
      try {
        const token = await user.getIdToken()
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
      } catch {
        // non-fatal
      }
    })
    return () => unsub()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' })
    await signOut(auth)
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden font-sans">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#111116]/80 backdrop-blur border border-white/10 rounded-lg shadow-md text-neon-green"
      >
        {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-[#0c0c0c] border-r border-white/5 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo area */}
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green shadow-[0_0_15px_rgba(0,255,65,0.15)]">
              <HomeIcon />
            </div>
            <div>
              <h1 className="text-lg font-mono font-bold text-neon-green tracking-wider text-glow mt-1">AGENCY OS</h1>
              <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Workspace</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto font-mono">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  group flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm tracking-wide
                  transition-all duration-300 relative overflow-hidden
                  ${isActive 
                    ? 'text-neon-green bg-neon-green/10 border border-neon-green/20 shadow-[0_0_15px_rgba(0,255,65,0.1)]' 
                    : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-green shadow-[0_0_10px_rgba(0,255,65,1)]" />
                )}
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <Icon />
                </div>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-red-400 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 transition-all font-mono text-sm tracking-wider uppercase"
          >
            <LogoutIcon />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative z-10 lg:p-10 p-6 pt-20 lg:pt-10 scroll-smooth">
        <div className="max-w-6xl mx-auto w-full animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  )
}