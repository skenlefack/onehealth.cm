'use client';

import { Language } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: 'beginner' | 'intermediate' | 'advanced';
  lang: Language;
  size?: 'sm' | 'md';
}

const levelConfig = {
  beginner: {
    fr: 'Débutant',
    en: 'Beginner',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  intermediate: {
    fr: 'Intermédiaire',
    en: 'Intermediate',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  advanced: {
    fr: 'Avancé',
    en: 'Advanced',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    dotColor: 'bg-red-500',
  },
};

export function LevelBadge({ level, lang, size = 'sm' }: LevelBadgeProps) {
  const config = levelConfig[level];
  const label = lang === 'en' ? config.en : config.fr;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bgColor,
        config.textColor,
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      {label}
    </span>
  );
}
