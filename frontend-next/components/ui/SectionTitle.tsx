import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  dark?: boolean;
  className?: string;
}

export function SectionTitle({
  badge,
  title,
  subtitle,
  align = 'center',
  dark = false,
  className,
}: SectionTitleProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn('mb-12', alignmentClasses[align], className)}>
      {badge && (
        <span
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4',
            dark
              ? 'bg-white/15 text-white'
              : 'bg-oh-light-blue text-oh-blue'
          )}
        >
          <Star size={14} />
          {badge}
        </span>
      )}
      <h2
        className={cn(
          'text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4',
          dark ? 'text-white' : 'text-oh-dark'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-lg max-w-2xl leading-relaxed',
            align === 'center' && 'mx-auto',
            dark ? 'text-white/85' : 'text-oh-gray'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
