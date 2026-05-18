'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SessionRequiredCardProps = {
  title: string;
  description: string;
  retryLabel: string;
  loginLabel: string;
  signupLabel?: string;
  onRetry: () => void;
  className?: string;
  dir?: 'rtl' | 'ltr';
};

export function SessionRequiredCard({
  title,
  description,
  retryLabel,
  loginLabel,
  signupLabel,
  onRetry,
  className,
  dir,
}: SessionRequiredCardProps) {
  return (
    <div className={className} dir={dir}>
      <div className="rounded-3xl border border-amber-300/20 bg-amber-500/5 p-6 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-300/20">
          <Lock className="h-6 w-6 text-amber-300" />
        </div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-sm text-slate-300">{description}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button
            onClick={onRetry}
            variant="outline"
            className="border-slate-600 text-slate-100 hover:bg-slate-800"
          >
            {retryLabel}
          </Button>
          <Link href="/login">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
              {loginLabel}
            </Button>
          </Link>
          {signupLabel ? (
            <Link href="/signup">
              <Button variant="ghost" className="text-cyan-300 hover:text-cyan-200 hover:bg-cyan-400/10 border border-cyan-300/20">
                {signupLabel}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
