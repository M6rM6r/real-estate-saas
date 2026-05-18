'use client';

import Link from 'next/link';
import type { ComponentType } from 'react';
import { ArrowRight, LayoutTemplate, ListChecks, Newspaper, Settings } from 'lucide-react';

type QuickRoute = {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  primary?: boolean;
};

const QUICK_ROUTES: QuickRoute[] = [
  {
    href: '/dashboard/page-builder',
    title: 'Page Builder',
    description: 'Customize your public page design, content, and branding.',
    icon: LayoutTemplate,
    primary: true,
  },
  {
    href: '/dashboard/listings',
    title: 'Listings',
    description: 'Manage properties/products that appear on your public page.',
    icon: ListChecks,
  },
  {
    href: '/dashboard/news',
    title: 'News',
    description: 'Publish announcements and updates for your audience.',
    icon: Newspaper,
  },
  {
    href: '/dashboard/settings',
    title: 'Settings',
    description: 'Update agency info, logo, domain, and account settings.',
    icon: Settings,
  },
];

export default function DashboardOverview() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 sm:p-8 shadow-[0_24px_80px_-40px_rgba(59,130,246,0.45)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Dashboard</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white">Welcome back 👋</h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-300">
            Pick where you want to continue. Your workspace is ready, and all tools are one click away.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {QUICK_ROUTES.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group rounded-2xl border p-5 transition-all ${
                  item.primary
                    ? 'border-blue-400/30 bg-blue-500/10 hover:bg-blue-500/15'
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20">
                      <Icon className="h-5 w-5 text-cyan-300" />
                    </div>
                    <h2 className="text-base font-semibold text-white">{item.title}</h2>
                    <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-cyan-300" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
