'use client';

import { Language } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  lang: Language;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  progress,
  lang,
  showLabel = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-slate-600">
            {lang === 'fr' ? 'Progression' : 'Progress'}
          </span>
          <span className="text-xs font-bold text-blue-600">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div className={cn('w-full bg-slate-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            clampedProgress >= 100
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
