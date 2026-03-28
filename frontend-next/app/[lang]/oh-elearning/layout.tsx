'use client';

import { useParams } from 'next/navigation';
import { AuthGuard } from '@/components/auth';
import { Language } from '@/lib/types';

export default function ELearningLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const lang = (params.lang || 'fr') as Language;

  return <AuthGuard lang={lang}>{children}</AuthGuard>;
}
