'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageBannerProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  variant?: 'default' | 'blue' | 'green' | 'orange';
}

export function PageBanner({ title, breadcrumbs, variant = 'default' }: PageBannerProps) {
  const gradients = {
    default: 'from-slate-900 via-slate-800 to-slate-700',
    blue: 'from-blue-950 via-blue-900 to-cyan-800',
    green: 'from-emerald-950 via-teal-900 to-cyan-800',
    orange: 'from-orange-950 via-amber-900 to-yellow-800',
  };

  return (
    <div className={`relative bg-gradient-to-br ${gradients[variant]} overflow-hidden`}>
      {/* Circular pattern background */}
      <div className="absolute inset-0">
        {/* Large circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 border border-white/10 rounded-full" />
        <div className="absolute -top-10 -left-10 w-60 h-60 border border-white/5 rounded-full" />
        <div className="absolute top-0 left-0 w-40 h-40 border border-white/10 rounded-full" />

        {/* Right side circles */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 border border-white/10 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 border border-white/5 rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 border border-white/10 rounded-full" />

        {/* Center decorative circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full" />

        {/* Small accent circles */}
        <div className="absolute top-4 right-1/4 w-24 h-24 border-2 border-white/10 rounded-full" />
        <div className="absolute bottom-4 left-1/3 w-16 h-16 border border-white/15 rounded-full" />
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-[5%] py-4">
        <div className="flex flex-col justify-center min-h-[70px]">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-1">
              <ol className="flex items-center gap-1 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center gap-1">
                    {index > 0 && (
                      <ChevronRight size={14} className="text-white/40" />
                    )}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white/80 font-medium">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-lg">
            {title}
          </h1>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
}
