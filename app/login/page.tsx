import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return {
    title: 'Wa9l — واصل',
    description: 'Page builder demo and login experience',
  };
}

export default function LoginPage() {
  redirect('/dashboard/page-builder');
}