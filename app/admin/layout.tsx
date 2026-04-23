'use client';

import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, Users, ScrollText, LogOut, Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/tenants', label: 'Tenants', icon: Users },
  { href: '/admin/logs', label: 'Logs', icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#00ff41] font-mono">
      {/* Header */}
      <header className="h-14 border-b border-[#00ff41]/20 flex items-center px-4 gap-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#00ff41]/60 hover:text-[#00ff41]"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <span className="font-bold text-sm tracking-wider">ADMIN_PANEL</span>
        </div>
        <div className="flex-1" />
        <nav className="hidden md:flex gap-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-bold transition-colors',
                pathname === item.href
                  ? 'bg-[#00ff41]/20 text-[#00ff41]'
                  : 'text-[#00ff41]/50 hover:text-[#00ff41] hover:bg-[#00ff41]/10'
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs font-mono"
        >
          <LogOut className="h-4 w-4 mr-1" /> TERMINATE
        </Button>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-b border-[#00ff41]/20 p-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                setMobileOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-bold transition-colors',
                pathname === item.href
                  ? 'bg-[#00ff41]/20 text-[#00ff41]'
                  : 'text-[#00ff41]/50 hover:text-[#00ff41]'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      )}

      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
