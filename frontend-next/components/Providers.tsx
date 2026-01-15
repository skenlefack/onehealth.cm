'use client';

import { ReactNode, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingProvider, useLoading } from '@/lib/LoadingContext';
import { PageLoader } from '@/components/ui/PageLoader';

function LoadingHandlerInner({ children }: { children: ReactNode }) {
  const { isLoading, stopLoading } = useLoading();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Stop loading when route changes complete
    stopLoading();
  }, [pathname, searchParams, stopLoading]);

  return (
    <>
      <PageLoader isLoading={isLoading} />
      {children}
    </>
  );
}

function LoadingHandler({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <LoadingHandlerInner>{children}</LoadingHandlerInner>
    </Suspense>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LoadingProvider>
      <LoadingHandler>{children}</LoadingHandler>
    </LoadingProvider>
  );
}
