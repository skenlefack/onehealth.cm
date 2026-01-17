'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Language } from '@/lib/types';

interface AuthGuardProps {
  children: React.ReactNode;
  lang: Language;
  redirectTo?: string;
}

export function AuthGuard({ children, lang, redirectTo }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const loginUrl = `/${lang}/auth/login`;
      const currentPath = window.location.pathname;
      const redirect = redirectTo || currentPath;
      router.push(`${loginUrl}?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [isAuthenticated, isLoading, router, lang, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-oh-blue mx-auto" />
          <p className="mt-4 text-gray-600">
            {lang === 'fr' ? 'Chargement...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
