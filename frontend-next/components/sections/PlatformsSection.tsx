'use client';

import Link from 'next/link';
import { Map, GraduationCap, AlertTriangle, ArrowRight } from 'lucide-react';
import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';
import { SectionTitle } from '@/components/ui';

interface PlatformsSectionProps {
  lang: Language;
  t: Translation;
}

const platformsData = [
  {
    key: 'ohwrMapping',
    icon: Map,
    href: '/ohwr-mapping',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/50',
    buttonBg: 'bg-emerald-500 hover:bg-emerald-600',
  },
  {
    key: 'elearning',
    icon: GraduationCap,
    href: '/oh-elearning',
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-500/20',
    hoverBorder: 'hover:border-blue-500/50',
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    key: 'cohrm',
    icon: AlertTriangle,
    href: '/cohrm-system',
    gradient: 'from-orange-500 to-red-600',
    iconBg: 'bg-orange-500/20',
    hoverBorder: 'hover:border-orange-500/50',
    buttonBg: 'bg-orange-500 hover:bg-orange-600',
  },
];

export function PlatformsSection({ lang, t }: PlatformsSectionProps) {
  return (
    <section className="py-20 px-[5%] bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <SectionTitle
          badge={t.platforms.badge}
          title={t.platforms.title}
          subtitle={t.platforms.subtitle}
        />

        {/* Platforms Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {platformsData.map((platform) => {
            const platformT = t.platforms[platform.key as keyof typeof t.platforms] as {
              title: string;
              description: string;
              button: string;
            };
            const Icon = platform.icon;

            return (
              <Link
                key={platform.key}
                href={`/${lang}${platform.href}`}
                className="group"
              >
                <div
                  className={`relative h-full bg-white rounded-3xl p-8 border-2 border-slate-100 ${platform.hoverBorder} transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2`}
                >
                  {/* Gradient accent top */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r ${platform.gradient}`}
                  />

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl ${platform.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon
                      size={32}
                      className={`bg-gradient-to-r ${platform.gradient} bg-clip-text`}
                      style={{
                        color: platform.key === 'ohwrMapping' ? '#10b981' : platform.key === 'elearning' ? '#3b82f6' : '#f97316',
                      }}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900">
                    {platformT.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                    {platformT.description}
                  </p>

                  {/* Button */}
                  <div
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold ${platform.buttonBg} transition-all duration-300 group-hover:gap-3`}
                  >
                    {platformT.button}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>

                  {/* Decorative background pattern */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                    <Icon size={128} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
