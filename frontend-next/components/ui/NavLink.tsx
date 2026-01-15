'use client';

import { useRouter } from 'next/navigation';
import { useLoading } from '@/lib/LoadingContext';
import { ReactNode, MouseEvent } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function NavLink({ href, children, className = '', onClick }: NavLinkProps) {
  const router = useRouter();
  const { startLoading } = useLoading();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick();
    startLoading();
    setTimeout(() => {
      router.push(href);
    }, 100);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
